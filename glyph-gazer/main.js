///////////////////
//// VARIABLES ////
///////////////////

// State

var gazeState = {}
var gazeStateDefaults = {
  text: "Abcde",
  fonts: "Open Sans, Roboto, Source Sans Pro",
  textAlign: 'center'
}
var localStorageGazeState = localStorage.getItem('gazeState')

// DOM Elements
var $gazeContainer = $('#gaze-container')
var $gazeInputFonts = $('#gaze-fonts')
var $fontsList = $('#fonts-list')
var $gazeSettings = $('#gaze-settings')

// Other
var googleFontsUrl = "https://fonts.googleapis.com/css?family="
var svg = '<svg><use xlink:href="#lines"/></svg>'



///////////////////
//// FUNCTIONS ////
///////////////////

function getUrlGazeState() {
  var match
  var pl = /\+/g // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g
  var decode = function(s) {
    return decodeURIComponent(s.replace(pl, " "))
  }
  var query = window.location.search.substring(1)

  var urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);

  return urlParams
}

function getLocalStorageGazeState() {
  return JSON.parse(localStorage.getItem('gazeState'))
}

function setLocalStorageState() {
  localStorage.setItem('gazeState', JSON.stringify(gazeState))
}

function updateUrl(){
  var newURL = getBaseUrl() + stateToUri()
  window.history.pushState("object or string", "Title", newURL);
}

function getDomFontList() {
  return $fontsList.val()
}

function parseCsvToArray(list) {
  var parsed = Papa.parse(list).data[0]

  // Check for and remove trailing commas
  if (parsed.lastIndexOf("") != -1) {
    parsed.pop()
  }

  return parsed
}


// Print out divs for all fonts
function printGlyphGlazers(arr) {
  $gazeContainer.empty()
  $.each(arr, function(i, font) {
    var trimmedFont = font.trim()
    var fontName = ''
    var fontWeight = 400
    if (trimmedFont.includes(":")) {
      fontName = trimmedFont.split(':')[0]
      fontWeight = trimmedFont.split(':')[1]
    } else {
      fontName = trimmedFont
    }

    // Create elements
    $gazeWrapper = $('<div></div>').addClass('gaze')
    $gazeText = $('<div></div>').addClass('gaze__text')
    $gazeMetrics = $('<div></div>').addClass('gaze__metrics').html(svg)

    // Add text and make editable
    $gazeText.html(gazeState.text)
    $gazeText.attr('contenteditable', 'true');

    // Add font styles
    $gazeWrapper.css({
      'font-family': fontName,
      'font-weight': fontWeight,
      'text-align': gazeState.textAlign
    })

    // Add font name to data attribute for css display 
    $gazeWrapper.attr('data-fontname', fontName)

    // Append to DOM
    $gazeWrapper.append($gazeText, $gazeMetrics)
    $gazeContainer.append($gazeWrapper)
  })
}


// Get Google Fonts URI compatible string from array of font objects
function getGoogleFontsURI(arr) {

  var familyParam = ""

  // Loop though fonts and add to familyParam string
  $.each(arr, function(i, font) {
    familyParam += font.trim()
    familyParam += '|'
  })

  // Remove last bar
  familyParam = familyParam.slice(0, -1)

  // Replace Spaces with plus.
  familyParam = familyParam.split(' ').join('+')
  return googleFontsUrl + familyParam
}

// Load google fonts
function loadGoogleFonts(arr) {
  $('#font-loading').html('<style>@import \'' + getGoogleFontsURI(arr) +
    '\';</style>')
}

// Get base url. Removes parameters.
function getBaseUrl(){
    return window.location.href.replace(/\?.*/,'');
}

// Convert object to URI string
function stateToUri(obj){
  // Set values to sync to URI
  var valuesToSync = ['textAlign','fonts', 'text']
  
  // Initialize URI string
  uriStr = '?'

  for (var i = valuesToSync.length - 1; i >= 0; i--) {
    var key = valuesToSync[i] 
    var value = gazeState[key]

    // Remove whitespaces
    value = value.replace(/, /g, ",");
    value = encodeURI(value); 

    // Build URI
    uriStr += key + '='
    uriStr += value
    uriStr += '&'
  };

  // Lazy remove last ampersand
  uriStr = uriStr.slice(0, -1)  

  return uriStr
}


// Prettify CSV with space after comma
function prettifyCSV(csvStr){
  return csvStr.replace(/,/g, ", "); 
}


function resetToDefaults(){
  gazeState = gazeStateDefaults
}


function updateView(){

}


//////////////
//// INIT ////
//////////////

// Extends default gazeState with any url parameters
gazeState = $.extend({}, gazeState, gazeStateDefaults)
gazeState = $.extend({}, gazeState, getLocalStorageGazeState())
gazeState = $.extend({}, gazeState, getUrlGazeState())
setLocalStorageState()


// Update state on gaze text edit
$gazeContainer.keyup(function(e) {
  var $thisGaze = $(e.target)
  var gazeText = $thisGaze.text()

  // Update all text elements except current gaze to avoid cursor jump
  $thisGaze.parent().siblings().children('.gaze__text').html(gazeText)

  // Update states
  gazeState.text = gazeText
  setLocalStorageState()
  updateUrl()
})

// Update state on font list edit
$gazeInputFonts.keyup(function(e) {
  gazeState.fonts = $(this).val()
  setLocalStorageState()
  loadGoogleFonts(parseCsvToArray(gazeState.fonts))
  printGlyphGlazers(parseCsvToArray(gazeState.fonts))
  updateUrl()
})


// Apply Settings
$gazeSettings.on('click', function(e){
  var $targ = $(e.target)

  if ( $targ.hasClass('align-left') ) {
    gazeState.textAlign = 'left';
  }else if ( $targ.hasClass('align-center') ){
    gazeState.textAlign = 'center';
  }else if ( $targ.hasClass('align-right') ){
    gazeState.textAlign = 'right';
  }else if ( $targ.hasClass('reset') ){
    resetToDefaults();
    // Fill input with font
    $gazeInputFonts.val( prettifyCSV(gazeState.fonts) )
  }
  setLocalStorageState()
  updateUrl()
  printGlyphGlazers(parseCsvToArray(gazeState.fonts))
})


// Fill input with font
$gazeInputFonts.val( prettifyCSV(gazeState.fonts) )

// fetchStorageFontList()
loadGoogleFonts(parseCsvToArray(gazeState.fonts))
printGlyphGlazers(parseCsvToArray(gazeState.fonts))
updateUrl()
