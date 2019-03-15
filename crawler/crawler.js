"use strict"
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
const axios = require("axios");
let rp = require('request-promise');
let firebase = require("firebase");
let admin = require('firebase-admin');
let SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config.json');

//Connect to Firebase
admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: config.databaseURL
});

let db = admin.firestore();

//Authenticate Spotify
let spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientID,
    clientSecret: config.spotifyClientSecret,
    redirectUri: config.spotifyRedirectUri
});

//Optional
spotifyApi.setAccessToken(config.spotifyAccessToken);

//Set Timeframe for Charts
let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
let urlBase = "https://www.billboard.com/charts/hot-100/";
let AllCharts = [];
let timestamp = new Date(1958, 6, 1);

// Crawl Data for Every 7 Days
for (let i = 0; timestamp < today; timestamp.setDate(timestamp.getDate() + 7), i++) {
    console.log("Current Date: " + timestamp);
    const timestampURL = (timestamp.getFullYear() + '-'
        + ('0' + (timestamp.getMonth() + 1)).slice(-2) + '-'
        + ('0' + timestamp.getDate()).slice(-2));

    let url = urlBase + timestampURL;
    console.log("Current URL: " + url);

    //Wait 10 seconds after each request, otherwise you will get blocked
    setTimeout(() =>
            getData(url, timestampURL),
        i * 10000
    );

}

//Crawl the Charts from Billboard
const getData = async (url, timestamp) => {
    try {
        const response = await axios.get(url)
            .then(function (response) {

                let $ = cheerio.load(response.data)

                let WeeklyCharts = {date: "", charts: []};
                let json = {title: "", artist: "", rank: ""};

                WeeklyCharts.date = timestamp;

                // Get number 1 title
                const title = $('.chart-number-one__title').text();
                const artist = $('.chart-number-one__artist').children().text();

                WeeklyCharts.charts.push({ title, artist, rank: 1 });

                console.log("Weekly Charts Top 1: " + url + " Object: " + WeeklyCharts);

                // Get 1 - 100
                let ChartDetailsChildren = $('.chart-details').children();

                for (let i = 0; i < ChartDetailsChildren.length; i++) {
                    let ChartDetailsChild = ChartDetailsChildren[i];

                    if (ChartDetailsChild.attribs.class.includes('chart-list')) {
                        let Charts = ChartDetailsChild.children; //chart-list-item ALL

                        for (let z = 0; z < Charts.length; z++) {
                            let Chart = Charts[z];
                            if (Chart.attribs) {
                                if (Chart.attribs.class.includes('chart-list-item  ')) {
                                    console.log(Chart.attribs["data-rank"]);
                                    const title = Chart.attribs["data-title"];
                                    const artist = Chart.attribs["data-artist"];
                                    const rank = Chart.attribs["data-rank"];

                                    // https://github.com/thelinmichael/spotify-web-api-node
                                    spotifyApi.searchTracks('track:' + title + ' artist:' + artist)
                                        .then(function(data) {
                                            console.log('Search tracks by ' + title + ' in the track name and + ' + artist + ' "Kendrick Lamar" in the artist name:', data.body);

                                            /* Get Audio Features for a Track */
                                            //Adopt this method and get those informations from the body you want to save to your firebase. Simply add them to the Chart Object
                                            spotifyApi.getAudioFeaturesForTrack(data.body.id)
                                                .then(function(data) {
                                                    console.log('Track Features' + data.body);
                                                }, function(err) {
                                                    done(err);
                                                });
                                        }, function(error) {
                                            console.log('Something went wrong', error);
                                        });

                                    WeeklyCharts.charts.push({ title, artist, rank });

                                }
                            }
                        }
                    }
                }

                AllCharts.push(WeeklyCharts);

                //Write in Firebase
                let docRef = db.collection('charts').doc();
                let setCharts = docRef.set({
                    timestamp : WeeklyCharts,
                });
            });
    } catch (error) {
        console.log("Something went wrong" + error);
    }
};


