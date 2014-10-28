// determine team color based on who is the home team,
// is it top or bottom of the inning, and are we looking
// at a pitcher or a batter
// 
// TODO: first, don't hard code the two world series
// teams here.  make a table, and look up team colors.
// also this is super verbose.  also, this is something
// that's probably better facilitated through css, maybe
// there could be a class for each set of team colors, 
// then dynamically apply that class to my divs?  Would
// also make it easier when I try to have multiple colors
// for each team.

function getColor(topInning, homeTeam, batter) {
    if (homeTeam === "Giants") {
        if (topInning === true) {
            return batter ? "#2043FF" : "orange";
        }
        else {
            return batter ? "orange" : "#2043FF";
        }
    } else {
        if (topInning === true) {
            return batter ? "orange" : "#2043FF";
        } else {
            return batter ? "#2043FF" : "orange";
        }
    }
}

// track id of winning and losing pitchers
// TODO: is there a better way to do this than
// global vars just sitting here?
var loser_id;
var winner_id;

function handleXml(xmlDoc) {
    
    var away_team = $(xmlDoc).find( "game" ).attr("away_team_name");
    var away_runs = $(xmlDoc).find( "game" ).attr("away_team_runs");
        
    var home_team = $(xmlDoc).find( "game" ).attr("home_team_name");
    var home_runs = $(xmlDoc).find( "game" ).attr("home_team_runs");
    
    var winningPitcher = $(xmlDoc).find("winning_pitcher");
    if (winningPitcher != null) {
        // after the game is over, there are just winning_pitcher 
        // and losing_pitcher nodes.  we can use that to indicate
        // whether the game is over, and also display that data.
        
        // hide the container for in-progress games
        // TODO: maybe that entire container contents should
        // be added from javascript, instead of just the batter
        // and pitcher information.  also need to watch out for
        // any flicker from showing then hiding this div
        $(".inProgress").hide();
        $(".completeGame").show();
        $(".stats").hide();
        
        var losingPitcher = $(xmlDoc).find("losing_pitcher");
        
        // track ids of pitchers
        winner_id = winningPitcher.attr("id");
        loser_id = losingPitcher.attr("id");
        
        // did the home team win?
        var home_win = ("1" === $(xmlDoc).find("game").attr("home_win"));
        
        var winner_name = winningPitcher.attr("first_name") +
            " " + winningPitcher.attr("last_name");
        
        var loser_name = losingPitcher.attr("first_name") +
            " " + losingPitcher.attr("last_name");
        
        $('.winner').html(winner_name);
        $('.loser').html(loser_name);
        
        $('.winner').css("background-color",
                         getColor(false, home_win ? home_team : away_team, true));
        $('.loser').css("background-color",
                        getColor(false,home_win ? away_team : home_team,true));


        // show stuff when you click on pitcher
        $(".winner").click({pitcher:winner_id},showPitcherData);
        $(".loser").click({pitcher:loser_id},showPitcherData);
    } else {
      
        $(".inProgress").show();
        $(".completeGame").hide();
        
        var topOfInning = $(xmlDoc).find("game").attr("top_inning");
        
        var current_batter = $(xmlDoc).find("current_batter").attr("first_name") + 
            " "+ $(xmlDoc).find("current_batter").attr("last_name");
        
        var current_pitcher = $(xmlDoc).find("current_pitcher").attr("first_name") + 
            " " + $(xmlDoc).find("current_pitcher").attr("last_name");
            
        
        $('.batter').html(current_batter);
        $('.pitcher').html(current_pitcher);
        
        $('.batter').css("background-color", getColor(topOfInning,home_team,true));
        $('.pitcher').css("background-color", getColor(topOfInning,home_team,false));
    }
    
    $('.score').html(
        home_team+": " + home_runs+"<br>"+away_team+": "+away_runs
    );

}

// helper to get url for game data
// TODO: might be better to pass in the Date object
// instead of always using current time.
function getUrlForToday() {
    var today = new Date();
    var year = today.getYear();
    var month = today.getMonth()+1;
    var day = today.getDate();
    
    return "http://gd2.mlb.com/components/game/mlb/year_"+year+"/month_"+month+"/day_"+day+"/playertracker.xml";
}

var gameToday = false;
var gameInProgress = false;

// currently hard-coded to the game on October 22nd
// TODO: check current date, show live data if game
// in progress, otherwise show results of most recent 
// game and time of next upcoming game.
function updateGameData() {
    $.ajax({url: "http://gd2.mlb.com/components/game/mlb/year_2014/month_10/day_22/playertracker.xml",
                               type: "GET",
                               dataType:"xml",
                               success:handleXml});
    console.log("Updated Score!");
}

function handlePitcherXml(xmlDoc) {
    var htmlString = "";
    var stats = $(xmlDoc).find("pitching");
    var ip = stats.attr("ip");
    var runs = stats.attr("r");
    var er = stats.attr("er");
    var hits = stats.attr("h");
    
    htmlString += "<div>Innings Pitched: "+ip+"</div>";
    htmlString += "<div>Hits: "+hits+"</div>";
    htmlString += "<div>Runs: "+runs+"</div>";
    htmlString += "<div>Earned Runs: "+er+"</div>";

    $(".stats").html(htmlString);
    $(".stats").toggle();
    $(".stats").click(function() {$(".stats").hide();});
}

// Given a pitcher id, fetch data from a separate xml file
// which contains their stats.  The success handler will 
// then parse that data, and toggle a div displaying the
// stats.
function showPitcherData(event) {
    $.ajax({url: "http://gd2.mlb.com/components/game/mlb/year_2014/month_10/day_22/pitchers/"+event.data.pitcher+"_1.xml",
                               type: "GET",
                               dataType:"xml",
                               success:handlePitcherXml});
}

updateGameData();

// update score every 10 seconds
// TODO: check for game in progress and enable
// this only when game is in progress
//window.setInterval(updateGameData, 10000);

