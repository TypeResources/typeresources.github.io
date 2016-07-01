var googleFontsUrl = "https://fonts.googleapis.com/css?family="
var urlQuery = location.search.replace('?q=', '')
var urlQueryDecoded = decodeURI(urlQuery)
var gazeState = {text: "abcde", fonts: "Open Sans, Roboto"}
var localStorageGazeState = localStorage.getItem('gazeState')
var $gazeContainer = $('#gaze-container')
var $gazeInputFonts = $('#gaze-fonts')
var $fontsList = $('#fonts-list')
var svg = '<svg><use xlink:href="#lines"/></svg>'


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

    $gazeWrapper = $('<div></div>').addClass('gaze')
    $gazeText = $('<div></div>').addClass('gaze__text')
    $gazeMetrics = $('<div></div>').addClass('gaze__metrics').html(svg)

    // Make text editable
    $gazeText.attr('contenteditable', 'true');

    // Add styles to text
    $gazeText.html(gazeState.text)
    $gazeWrapper.css({
      'font-family': fontName,
      'font-weight': fontWeight
    })


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



// init
// Extends default gazeState with any url parameters
gazeState = $.extend({}, gazeState, getLocalStorageGazeState())
gazeState = $.extend({}, gazeState, getUrlGazeState())
setLocalStorageState()


// Update on edit
$gazeContainer.keyup(function(e) {
  var activeGaze = $(e.target)
  var gazeText = activeGaze.text()
  activeGaze.parent().siblings().children('.gaze__text').html(gazeText)
  gazeState.text = gazeText
  setLocalStorageState()
})

$gazeInputFonts.keyup(function(e) {
  gazeState.fonts = $(this).val()
  setLocalStorageState()
  loadGoogleFonts(parseCsvToArray(gazeState.fonts))
  printGlyphGlazers(parseCsvToArray(gazeState.fonts))
})

$gazeInputFonts.val(gazeState.fonts)

// fetchStorageFontList()
loadGoogleFonts(parseCsvToArray(gazeState.fonts))
printGlyphGlazers(parseCsvToArray(gazeState.fonts))
