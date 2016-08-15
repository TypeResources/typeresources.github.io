function csvValuesToStringValues(t){return""!=t?(t=t.replace(/ /g,""),t='"'+t,t=t.replace(/,/g,'", "'),t+='"'):""}function getLocalStorageGazeState(){return JSON.parse(localStorage.getItem("gazeState"))}function setLocalStorageState(){localStorage.setItem("gazeState",JSON.stringify(gazeState))}function getUrlGazeState(){for(var t,e=/\+/g,a=/([^&=]+)=?([^&]*)/g,o=function(t){return decodeURIComponent(t.replace(e," "))},n=window.location.search.substring(1),r={};t=a.exec(n);)r[o(t[1])]=o(t[2]);return r}function getBaseUrl(){return window.location.href.replace(/\?.*/,"")}function stateToUri(t){var e=["text","fonts","openType","textAlign","zoom"];uriStr="?";for(var a=0;a<e.length;a++){var o=e[a],n=t[o];n=n.replace(/, /g,","),n=encodeURI(n),n=n.replace(/#/g,"%23"),uriStr+=o+"=",uriStr+=n,uriStr+="&"}return uriStr=uriStr.slice(0,-1),uriStr}function getGoogleFontsURI(t){var e="";return $.each(t,function(t,a){e+=a.trim(),e+="|"}),e=e.slice(0,-1),e=e.split(" ").join("+"),googleFontsUrl+e}function parseCsvToArray(t){var e=Papa.parse(t).data[0];return e}function loadGoogleFonts(t){$("#font-loading").html("<style>@import '"+getGoogleFontsURI(t)+"';</style>")}var initialGazeState,localStorageGazeState=getLocalStorageGazeState(),gazeStateDefaults={text:"Adhesion",fonts:"Open Sans, Roboto:900, Source Sans Pro:200",textAlign:"center",openType:"kern, calt, liga",zoom:"1"},googleFontsUrl="https://fonts.googleapis.com/css?family=",svg='<svg><use xlink:href="#lines"/></svg>',placeholderFontName="WOFF empty-Regular";svg4everybody(),initialGazeState=$.extend({},initialGazeState,gazeStateDefaults),initialGazeState=$.extend({},initialGazeState,getLocalStorageGazeState()),initialGazeState=$.extend({},initialGazeState,getUrlGazeState()),loadGoogleFonts(parseCsvToArray(initialGazeState.fonts));var gg=new Vue({el:"#app",data:{gazeState:initialGazeState,fixedState:{showGuides:!0}},computed:{zoomPercent:function(){return 100*this.gazeState.zoom+"%"},fontArray:function(){var t,e=this.gazeState.fonts,a=[];return t=e.split(","),t.lastIndexOf("")!=-1&&t.pop(),t.forEach(function(t){var e=t.trim(),o="",n=400;e.includes(":")?(o=e.split(":")[0],n=e.split(":")[1]):o=e,a.push({name:o,weight:n})}),a},openTypeCssValue:function(){var t,e=this.gazeState.openType;e=e.replace(/ /g,"");for(var a=e.split(","),o=[],n=0;n<a.length;n++)4==a[n].length&&o.push(a[n]);for(t=csvValuesToStringValues(o.toString()),t.indexOf("kern")==-1&&(t+=',"kern" off'),t.indexOf("liga")==-1&&(t+=',"liga" off'),t.indexOf("calt")==-1&&(t+=',"calt" off');","===t.charAt(0);)t=t.substr(1);return t}},methods:{updateText:function(t){var e=t.target.innerText;this.gazeState.text=e},saveGazeState:function(){localStorage.setItem("gazeState",JSON.stringify(this.gazeState))},setUrlGazeState:function(){var t=getBaseUrl()+stateToUri(this.gazeState);window.history.pushState("object or string","Title",t)},clearUrl:function(){var t=window.location.href,e=getBaseUrl();t!=e&&(window.history.pushState("object or string","Title",e),console.log("URL cleared"))},resetToDefaults:function(){this.gazeState=$.extend({},{},gazeStateDefaults)},setAlign:function(t){this.gazeState.textAlign=t}},watch:{gazeState:{handler:function(t,e){this.saveGazeState(),this.clearUrl()},deep:!0},"gazeState.fonts":function(){loadGoogleFonts(parseCsvToArray(this.gazeState.fonts))}}});