var googleFontsUrl = "https://fonts.googleapis.com/css?family="
var urlQuery = location.search.replace('?q=','')
var urlQueryDecoded = decodeURI(urlQuery)
var gazeText = 'abc'
var $fontsList = $('#fonts-list')
var storageList = localStorage.getItem('fontsList')

// Override default if url query
if ( urlQueryDecoded.length ) {
  gazeText = urlQueryDecoded
}

function getStorageFontList() {
  if (storageList) {
    fontList = storageList
  } else {
    fontList = $fontsList.val()
  }
  return fontList
}

function setStorageFontList() {
  localStorage.setItem('fontsList', $fontsList.val())
}

function fetchStorageFontList() {
  if (storageList) {
    $fontsList.val(storageList)
  }
}

function parseCsvToArray(list) {
  var parsed = Papa.parse(list).data[0]
  
  // Check for and remove trailing commas
  if (parsed.lastIndexOf("") != -1) {
    parsed.pop()
  }
  
  return parsed
}

function getDomFontList() {
  return $fontsList.val()
}


// Print out divs for all fonts
function printGlyphGlazers(arr) {
  $('#gaze-container').empty()
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
    
    // Build dom element with styles
    var glyphGazer = '<div data-font="'
    glyphGazer += fontName
    glyphGazer += '" class="glyph-gazer" contenteditable="true" style="font-family:\''
    glyphGazer += fontName
    glyphGazer += '\'; font-weight:'
    glyphGazer += fontWeight
    glyphGazer += '" tabindex="1">'
    glyphGazer += gazeText
    glyphGazer += '</div>'
    $('#gaze-container').append(glyphGazer)
  })
}

// Get Google Fonts URI compatible string from array of font objects
function getGoogleFontsURI(arr){

	var familyParam = ""

	// Loop though fonts and add to familyParam string
	$.each(arr, function(i, font){
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
  $('#font-loading').html('<style>@import \'' + getGoogleFontsURI(arr) + '\';</style>')
//  console.log(getGoogleFontsURI(arr))
}

// Update on edit
$('#gaze-container').keyup( function(e){
  var activeGaze = $(e.target)
  gazeText = activeGaze.text()
  activeGaze.siblings().html(gazeText)
})

$fontsList.keyup( function() {
  setStorageFontList()
  loadGoogleFonts(parseCsvToArray(getDomFontList()))
  printGlyphGlazers(parseCsvToArray(getDomFontList()))
})

fetchStorageFontList()
loadGoogleFonts(parseCsvToArray(getStorageFontList()))
printGlyphGlazers(parseCsvToArray(getStorageFontList()))
