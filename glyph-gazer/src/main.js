///////////////////
//// VARIABLES ////
///////////////////

var initialGazeState
var localStorageGazeState = getLocalStorageGazeState()
var gazeStateDefaults = {
  text: "Adhesion",
  fonts: "Open Sans, Roboto:900, Source Sans Pro:200",
  textAlign: 'center',
  openType: 'kern, calt, liga',
  zoom: '1'
}

var googleFontsUrl = "https://fonts.googleapis.com/css?family="
var svg = '<svg><use xlink:href="#lines"/></svg>'
var placeholderFontName = "WOFF empty-Regular"


//////////////////////
//// Preparations ////
//////////////////////

// Loads svg4everybody polyfill in old browsers
svg4everybody()

// Extends default gazeState with any url parameters
initialGazeState = $.extend({}, initialGazeState, gazeStateDefaults)
initialGazeState = $.extend({}, initialGazeState, getLocalStorageGazeState())
initialGazeState = $.extend({}, initialGazeState, getUrlGazeState())

// Initial font loading
loadGoogleFonts( parseCsvToArray(initialGazeState.fonts) )




////////////////////
//// Vue.js App ////
////////////////////


var gg = new Vue({
  el: '#app',

  //////////////
  //// Data ////
  //////////////
  data: {
    gazeState: initialGazeState,
    fixedState: {
      showGuides: true
    }
  },

  /////////////////////////
  //// Computed values ////
  /////////////////////////
  computed: {
    zoomPercent: function(){
      return (this.gazeState.zoom * 100) + "%"
    },
    fontArray: function(){
      var csvStr = this.gazeState.fonts
      var arr
      var fontArr = []
      
      // Split into array
      arr = csvStr.split(",")
      if (arr.lastIndexOf("") != -1) {
          arr.pop()
      }
      // Separate font name from weight
      arr.forEach(function(font){
        var trimmedFont = font.trim()
        var fontName = ''
        var fontWeight = 400
        if (trimmedFont.includes(":")) {
          fontName = trimmedFont.split(':')[0]
          fontWeight = trimmedFont.split(':')[1]
        } else {
          fontName = trimmedFont
        }
        fontArr.push({
          name: '"' + fontName + '"',
          weight: fontWeight
        })
      })
      return fontArr
    },
    openTypeCssValue: function(){

      // Generate css compatible OpenType feature list
      // each feature must be exactly 4 chars each
      var otFeats = this.gazeState.openType
      var otCssString

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
      otCssString = csvValuesToStringValues(cleanArr.toString())

      // Check for 'kern', 'liga' and 'calt'
      // If they dont exist, turn them off to counter browser default settings
      if (otCssString.indexOf('kern') == -1) {
        otCssString += ',"kern" off'
      };
      if (otCssString.indexOf('liga') == -1) {
        otCssString += ',"liga" off'
      };
      if (otCssString.indexOf('calt') == -1) {
        otCssString += ',"calt" off'
      };

      // Remove inital comma when original string is empty
      while(otCssString.charAt(0) === ',')
          otCssString = otCssString.substr(1);

      return otCssString
    }
  },

  /////////////////
  //// Methods ////
  /////////////////
  methods: {
    updateText: function(e){
      var newText = e.target.innerText
      this.gazeState.text = newText
    },
    saveGazeState: function(){
      localStorage.setItem('gazeState', JSON.stringify(this.gazeState))
    },
    setUrlGazeState: function(){
      var newURL = getBaseUrl() + stateToUri(this.gazeState)
      window.history.pushState("object or string", "Title", newURL)
    },
    clearUrl: function() {
      var fullUrl = window.location.href
      var baseUrl = getBaseUrl()
      if (fullUrl != baseUrl) {
        window.history.pushState("object or string", "Title", baseUrl)
        console.log("URL cleared")
      };
    },
    resetToDefaults: function(){
      this.gazeState = $.extend({}, {}, gazeStateDefaults)
    },
    setAlign: function(string){
      this.gazeState.textAlign = string
    }
  },

  //////////////////
  //// Watchers ////
  //////////////////
  watch: {
    'gazeState': {
      handler: function (val, oldVal) {
        this.saveGazeState()
        this.clearUrl()
      },
      deep: true
    },
    'gazeState.fonts': function(){
      loadGoogleFonts( parseCsvToArray(this.gazeState.fonts) )
    }
  }
})







////////////////////
//// FUNCTIONS ////
////////////////////

function csvValuesToStringValues(str){
  if (str != "") {
    //remove spaces
    str = str.replace(/ /g, "")
    //add quotes
    str = '"' + str
    str = str.replace(/,/g, '", "')
    str = str + '"'
    return str
  }else{
    return ""
  }
}

function getLocalStorageGazeState() {
  return JSON.parse(localStorage.getItem('gazeState'))
}

function setLocalStorageState() {
  localStorage.setItem('gazeState', JSON.stringify(gazeState))
}

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

// Get base url. Removes parameters.
function getBaseUrl(){
    return window.location.href.replace(/\?.*/,'');
}


// Convert object to URI string
function stateToUri(state){
  // Set values to sync to URI
  var valuesToSync = ['text', 'fonts', 'openType', 'textAlign', 'zoom']

  // Initialize URI string
  uriStr = '?'

  for (var i = 0; i < valuesToSync.length; i++) {
    var key = valuesToSync[i]
    var value = state[key]

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

function parseCsvToArray(list) {
  var parsed = Papa.parse(list).data[0]
  return parsed
}


// Load google fonts
function loadGoogleFonts(arr) {
  $('#font-loading').html('<style>@import \'' + getGoogleFontsURI(arr) +
    '\';</style>')
}