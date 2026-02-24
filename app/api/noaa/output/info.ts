class Info {

    printInfo() {
        console.log("\n");
        
        console.log("All weather is in the format: RealFeel{H} StormRating{W}{T} {SmileyFace}");
        console.log("RealFeel is rounded to the nearest 5, H will show if it is humid.");
        console.log("W will show if it is windy, and T will show if there is a chance of Thunderstorms.");
        console.log("The severity / chance of everything is color coded: bright red (worst / highest) to green (best / no) with grey being decent / low.\n");
        console.log("StormRating is a composite of: Cloud Cover, Precipitation, Wind, and Thunder, rounded to 1-1.5 signifigant figures, a guide is below:");
        console.log(" - <10 Not Overcast: Max cloud cover is the number x 10% so 5 = 50%. Cloud cover can be a little lower if there is a W or T listed.")
        console.log(" - 10-19 Overcast: If ~10 precipitation very unlikely, could also be partially clear if there is winds or thunder.");
        console.log(" - 20-29 Drizzle/Flurry: Some precipitation possible. Definitely overcast.");
        console.log(" - 30-39 Precipatory: Some precipitation likely, sky slightly darker.");
        console.log(" - 40-49 Storm: Storm conditions, precipitation effectively guaranteed, sky much darker.");
        console.log(" - 50+ Strong Storm: Stronger precipitation and/or stronger winds/thunder. Possible severe storm, check other forecasts.\n");

        console.log("A smiley face with glasses will appear if: the realfeel & storm factor are considered good (green) AND it is not humid at all (excellent weather).");
        console.log("A regular smiley face will appear if the conditions are decently nice such as a grey and green or an orange and green factor above.");
        console.log("To prevent this text from showing, use the option -d to dismiss.");
    }

}

export default new Info();