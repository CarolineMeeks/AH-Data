var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
var processedData;

                    
/*
 0 - email
 1 - Date
 */

function readData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
 var sheet = ss.getSheetByName("Form Responses 1");
  var data = sheet.getDataRange().getValues();
  var uniqueEmails=[];
  var startWeight = {};
  var deltaWeight = {};
  var startWaist = {};
  var deltaWaist = {};
  for (var i = 1; i < data.length; i++) {
    var email = data[i][1].toLowerCase();
    var date = new Date(data[i][0]);
    date.setHours(23);
    date.setMinutes(59);
    
    if (data[i][2] == "Yesterday") {
      //Logger.log("Yesterday");
      date.setTime(date.getTime() - MILLIS_PER_DAY);
    }
     //Logger.log(data[i][2]+data[i][0]+date);

    if (uniqueEmails.indexOf(email) < 0) {
      startWeight[email] = data[i][19];
      startWaist[email] = data[i][20];
      uniqueEmails[uniqueEmails.length]=email;
      existingSheet = ss.getSheetByName(email)
      if (existingSheet) { //Delete chart sheet if it already exists.
        ss.deleteSheet(existingSheet);     
      }
      chartSheet = ss.insertSheet(email); //create a chartsheet for this email   
       chartSheet.appendRow(["email","Date","Color", "AH Score", "Full Score","Weight Change", "Waist Change"]);
    }
    
    var aHScore = data[i][3]+data[i][4]+data[i][5]+data[i][6]+data[i][7]+data[i][8];
    var fullScore = aHScore;
    var color = "black";
    
    //Reduce score by 2pts for 2 processed carbs and 4 pts for 3 or more.
    if (data[i][9] == 2) { fullScore = fullScore - 2;};
    if (data[i][9] == "3 or more") { fullScore = fullScore - 4;};
    
    if (data[i][11].length) {fullScore = fullScore + data[i][11].split(",").length;};     //Increase score by 1pt for each relaxation exercise
   
    if (data[i][12].length) {fullScore = fullScore + data[i][12].split(",").length;};   //Increase score by 1pt for each walk
   
    if (data[i][13].length) {fullScore = fullScore + 2;};   //Increase score by 2pt for joyful movement
    
    if (data[i][14] == "Yes") {fullScore = fullScore + 1;};   //Increase score by 1pt for bedtime routine
    
    if (data[i][19]) {  //There is a weight entry
      Logger.log(email + startWeight[email] + data[i][19]);
      Logger.log(startWeight);
      deltaWeight[email] = startWeight[email] - data[i][19];
    }
    
    if (data[i][20]) {  //There is a waist entry
     
      deltaWaist[email] = startWaist[email] - data[i][20];
    }
    
    //Add data to chartsheet
    chartSheet = ss.getSheetByName(email);
    chartSheet.appendRow([email,date,color,aHScore,fullScore, deltaWeight[email], deltaWaist[email]]);
    
  }

  for (var e = 0; e < uniqueEmails.length; e++) {
    chartSheet = ss.getSheetByName(uniqueEmails[e]);
    var range = chartSheet.getRange("B2:F"); //hard coding for testing
    var chartBuilder = chartSheet.newChart();
    var dateRange = chartSheet.getRange("B2:B");
    dateRange.setNumberFormat('MM/dd') ;  
    title = uniqueEmails[e] + "AH Chart"
    
    
    //Set up data table
    var data = new Charts.DataTable().build();

    // Declare columns
    data.addColumn('datetime', 'Date');
    data.addColumn('number', 'AH Score');
    data.addColumn('string', {'type': 'string', 'role': 'style'});
    
     data.addRows(range.length);
    for (var i = 1; i < range.length; i++) {
      data.setCell(i,0,range[i][1]);  //x is date
      data.setCell(i,1,range[i][2]); //y is AH Score
      data.setCell(i,1,range[i][3]);
      
    }
    
    

    
    var chart = chartSheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .setOption('title', title)
    .setOption('pointSize', 10)
    .setPosition(2, 8, 1, 1)
    .addRange(range)
    
    .build();
  chartSheet.insertChart(chart);
  }
}
