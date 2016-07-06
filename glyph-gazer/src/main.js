///////////////////
//// VARIABLES ////
///////////////////

// State
var gazeState = {}
var gazeStateDefaults = {
  text: "Adhesion",
  fonts: "Open Sans, Roboto:900, Source Sans Pro:200",
  textAlign: 'center',
  openType: 'frac',
  zoom: '1'
}
var localStorageGazeState = localStorage.getItem('gazeState')

// DOM Elements
var $gazeContainer = $('#gaze-container')
var $gazeInputFonts = $('#gaze-fonts')
var $gazeInputOpenType = $('#gaze-opentype')
var $gazeInputZoom = $('#gaze-zoom')
var $fontsList = $('#fonts-list')
var $gazeSettingsButton = $('#gaze-settings button')

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
function updateViewGlyphGazers(arr) {
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
    $gazeMetrics = $('<div></div>').addClass('gaze__metrics hideable').html(svg)

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

    // Update Gaze Styles
    updateViewZoom(gazeState.zoom)
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
  var valuesToSync = ['text', 'fonts', 'openType', 'textAlign', 'zoom']

  // Initialize URI string
  uriStr = '?'

  for (var i = 0; i < valuesToSync.length; i++) {
    var key = valuesToSync[i]
    var value = gazeState[key]

    // Remove whitespaces
    value = value.replace(/, /g, ",")
    value = encodeURI(value)

    // fix '#'' url problem
    value = value.replace(/#/g, "%23")

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

  // Remove unecessary spaces after comma
  csvStr = csvStr.replace(/,   /g, ",")
  csvStr = csvStr.replace(/,  /g, ",")
  csvStr = csvStr.replace(/, /g, ",")

  // Add space after comma and return
  return csvStr.replace(/,/g, ", ")
}

function resetToDefaults(){
  gazeState = $.extend({}, {}, gazeStateDefaults)
  $('body').removeClass()
}

function csvValuesToStringValues(str){
  //remove spaces
  str = str.replace(/ /g, "")
  //add quotes
  str = '"' + str
  str = str.replace(/,/g, '", "')
  str = str + '"'
  return str
}

function updateViewOpenType(stateVal){

  // Generate css compatible OpenType feature list
  // each feature must be exactly 4 chars each
  var otFeats = gazeState.openType

  // Remove whitespace
  otFeats = otFeats.replace(/ /g, "");

  // Remove all non-4-char values
  var dirtyArr = otFeats.split(",")
  var cleanArr = []
  for (var i = 0; i < dirtyArr.length; i++) {
    if (dirtyArr[i].length == 4) {
      cleanArr.push(dirtyArr[i])
    };
  };

  // Add double quotemark to values
  var otCssString = csvValuesToStringValues(cleanArr.toString())
  $gazeContainer.attr('style', 'font-feature-settings: ' + otCssString)
}

function updateViewZoom(multiplier){
  var percent = multiplier * 100
  var cssVal = percent + '%'
  $('.gaze').children().css('font-size', cssVal)
}


//////////////////////////
//// USER INTERACTION ////
//////////////////////////

// Update state on gaze text edit
$gazeContainer.keyup(function(e) {
  var $thisGaze = $(e.target)
  var gazeText = $thisGaze.text()

  // Update all text elements except current gaze to avoid cursor jump
  $thisGaze.parent().siblings().children('.gaze__text').html(gazeText)

  // Update states
  gazeState.text = gazeText
  setLocalStorageState()
})

// Update state on font list edit
$gazeInputFonts.keyup(function(e) {
  // Update State
  gazeState.fonts = $(this).val()
  setLocalStorageState()

  // Load fonts
  loadGoogleFonts(parseCsvToArray(gazeState.fonts))
  
  // Update canvas view
  updateViewGlyphGazers(parseCsvToArray(gazeState.fonts))
})

// Update state on Open Type edit
$gazeInputOpenType.keyup(function(e) {
  var inputVal = $(this).val()

  // Update State
  gazeState.openType = prettifyCSV(inputVal)
  setLocalStorageState()

  //Update canvas view
  updateViewOpenType(gazeState.openType)
})

// Apply Settings
$gazeSettingsButton.on('click', function(){
  $this = $(this)
  if ( $this.hasClass('align-left') ) {
    gazeState.textAlign = 'left';
    $('.gaze').css('text-align',gazeState.textAlign)
  } else if ( $this.hasClass('align-center') ) {
    gazeState.textAlign = 'center';
    $('.gaze').css('text-align',gazeState.textAlign)
  } else if ( $this.hasClass('align-right') ) {
    gazeState.textAlign = 'right';
    $('.gaze').css('text-align',gazeState.textAlign)
  } else if ( $this.hasClass('share-url') ) {
    updateUrl()
  } else if ( $this.hasClass('reset') ) {
    resetToDefaults();

    // Update UI Values
    $gazeInputFonts.val( prettifyCSV(gazeState.fonts) )
    $gazeInputOpenType.val( prettifyCSV(gazeState.openType) );
    $gazeInputZoom.val( gazeState.zoom )

    // Update canvas view
    updateViewGlyphGazers(parseCsvToArray(gazeState.fonts))
    updateViewOpenType(gazeState.openType)
    updateViewZoom(gazeState.openType)

  } else if ( $this.hasClass('toggle-lines') ) {
    $('body').toggleClass('hide-stuff')
  }

  // Save updated state to Local Storage
  setLocalStorageState()
})


// Zoom based on input
// TODO save zoomlevel to state and then update css based on state
$gazeInputZoom.on('change click', function(){
  var inputVal = $(this).val()

  // Update State
  gazeState.zoom = inputVal
  setLocalStorageState()

  // Update canvas view
  updateViewZoom(gazeState.zoom)
})


//////////////
//// INIT ////
//////////////

// Loads svg4everybody polyfill in old browsers
svg4everybody()

// Extends default gazeState with any url parameters
gazeState = $.extend({}, gazeState, gazeStateDefaults)
gazeState = $.extend({}, gazeState, getLocalStorageGazeState())
gazeState = $.extend({}, gazeState, getUrlGazeState())
setLocalStorageState()

// Load fonts
loadGoogleFonts(parseCsvToArray(gazeState.fonts))

// Update UI Values
$gazeInputFonts.val( prettifyCSV(gazeState.fonts) )
$gazeInputOpenType.val( prettifyCSV(gazeState.openType) )
$gazeInputZoom.val( gazeState.zoom )

// Update canvas view
updateViewGlyphGazers(parseCsvToArray(gazeState.fonts))
updateViewOpenType(gazeState.openType)
updateViewZoom(gazeState.zoom)