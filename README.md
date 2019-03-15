# Music Chart Cralwer
This code was created during an university project at the University of Mannheim. The prupose of this crawler is to crawl the Billboard TOP100 charts. You can specify the timeframe and the ammount of snapshots the crawler should make. The default distance between each snapshot is 7 days. The data is written into an Firebase Database. Through this it is relativley easy to work further on and add more attributes to each song / artists. Currently the Spotify Web API is used to add metadata as well as song attributes to each entry. 

## How to use it
1. You need to create a config.json on the top level with the following structure:
```bash
{
  "serviceAccount" : "/Users/YourUser/FirebaseAdminSDK.json",
  "databaseURL" : "https://YourFirebaseProjectID.firebaseio.com",
  "spotifyClientID" : "SeeSpotifyDocumentation",
  "spotifyClientSecret" : "SeeSpotifyDocumentation",
  "spotifyRedirectUri": "SeeSpotifyDocumentation",
  "spotifyAccessToken" : "SeeSpotifyDocumentation"
}
```

2. Fill in your IDs and Tokens above. For Spotify please refer to: https://developer.spotify.com/documentation/general/guides/authorization-guide/

3. Run npm install inside /crawler
4. To run the code type ``` node crawler.js ``` 


