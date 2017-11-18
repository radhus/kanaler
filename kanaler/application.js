//# sourceURL=application.js

//
//  application.js
//  kanaler
//
//  Created by William Johansson on 2017-11-02.
//  Copyright © 2017 William Johansson. All rights reserved.
//

/*
 * This file provides an example skeletal stub for the server-side implementation 
 * of a TVML application.
 *
 * A javascript file such as this should be provided at the tvBootURL that is 
 * configured in the AppDelegate of the TVML application. Note that  the various 
 * javascript functions here are referenced by name in the AppDelegate. This skeletal 
 * implementation shows the basic entry points that you will want to handle 
 * application lifecycle events.
 */

/**
 * @description The onLaunch callback is invoked after the application JavaScript 
 * has been parsed into a JavaScript context. The handler is passed an object 
 * that contains options passed in for launch. These options are defined in the
 * swift or objective-c client code. Options can be used to communicate to
 * your JavaScript code that data and as well as state information, like if the 
 * the app is being launched in the background.
 *
 * The location attribute is automatically added to the object and represents 
 * the URL that was used to retrieve the application JavaScript.
 */
App.onLaunch = function(options) {
    var alert = createAlert("Hello World!", "Welcome to tvOS");
    navigationDocument.pushDocument(alert);
}


App.onWillResignActive = function() {

}

App.onDidEnterBackground = function() {

}

App.onWillEnterForeground = function() {
    
}

App.onDidBecomeActive = function() {
    
}

App.onWillTerminate = function() {
    
}


var handleSelect = function(event) {
    let lockup = event.target;
    let videoURL = lockup.getAttribute("videoURL");
    let mediaItem = new MediaItem("video", videoURL);
    let player = new Player();
    player.playlist = new Playlist();
    
    player.playlist.push(mediaItem);
    player.present();
}

var fetchJSON = function(url) {
    let templateXHR = new XMLHttpRequest();
    templateXHR.responseType = "document";
    
    var results;
    
    templateXHR.addEventListener("load", function() {results = JSON.parse(templateXHR.responseText); }, false);
    templateXHR.open("GET", url, false);
    templateXHR.send();
    
    return results;
}

var getVideoURL = function(channel) {
    let data = fetchJSON("https://api.svt.se/videoplayer-api/video/ch-" + channel.toLowerCase());
    console.log("getVideoURL got data:");
    console.log(data);
    if("videoReferences" in data) {
        return data["videoReferences"][1]["url"];
    }
    return false;
}

Date.prototype.toIsoString = function() {
    var pad = function(num) {
        var norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
    };
    return this.getFullYear() +
    '-' + pad(this.getMonth() + 1) +
    '-' + pad(this.getDate()) +
    'T' + pad(this.getHours()) +
    ':' + pad(this.getMinutes()) +
    ':' + pad(this.getSeconds());
}

var getChannels = function() {
    console.log("get channel_page");
    let now = new Date().toIsoString();
    let data = fetchJSON("https://www.svtplay.se/api/channel_page?now=" + now);
    console.log("got data");
    console.log(data);
    let channels = "";
    for (i = 0; i < data["hits"].length; i++) {
        console.log("i:", i);
        let channel = data["hits"][i];
        console.log("channel:");
        console.log(channel);
        let name = channel["channel"];
        console.log("name:", name);
        let videoURL = getVideoURL(name);
        if (!videoURL) {
            console.log("skipping channel");
            continue
        }
        console.log("videoURL:", videoURL);
        let imgURL = "https://www.svtstatic.se/image/wide/650/" + channel["titlePageThumbnailIds"][0] +".jpg"
        console.log("imgURL:", imgURL);
        let title = channel['episodeTitle'];
        channels += `
            <lockup videoURL="` + videoURL + `">
                <img src="` + imgURL + `" width="360" height= "270" />
                <title>${name}</title>
                <row>
                    <subtitle>${title}</subtitle>
                </row>
                <badge src="http://www.gunnebo.se/PublishingImages/red%20cirkle.png" width="64" height="64"/>
            </lockup>
        `;
    }
    return channels;
}

/**
 * This convenience funnction returns an alert template, which can be used to present errors to the user.
 */
var createAlert = function(title, description) {
    console.log("get my channels");
    let items = getChannels();
    
    var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
          <stackTemplate>
            <banner>
              <title>SVTPlay kanaler</title>
            </banner>
            <collectionList>
                <shelf>
                    <section>${items}</section>
                </shelf>
            </collectionList>
          </stackTemplate>
        </document>`
    console.log(alertString);

    var parser = new DOMParser();

    var alertDoc = parser.parseFromString(alertString, "application/xml");
    alertDoc.addEventListener("select", handleSelect);
    return alertDoc
}
