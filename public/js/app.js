console.log("app.js is loaded");

const movieInput = $('#movie-search');
const searchButton = $('#search-button');
var thePoster = $('#poster');
var caption = $('#caption');
var textArea = $('#discussion');
var saveButton = $('#save-button');

textArea.hide();
saveButton.hide();

searchButton.on('click', function(){
  console.log('clicked')
  var requestSettings = {
    method: 'get',
    url: '/search/'+ movieInput.val()
  }
  function callback(data){
    console.log(data.results[0])
    overview = data.results[0].overview
    poster = data.results[0].poster_path
    thePoster.append('<img src="https://image.tmdb.org/t/p/w500'+ poster +'" />')
    caption.append(overview)
  }
  $.ajax(requestSettings).done(callback)
  textArea.show();
  saveButton.show();
});

saveButton.on('click',function(){
  console.log('clicked save butttttton')
  
})
