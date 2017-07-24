console.log("app.js is loaded");

const movieInput = $('#movie-search');
const searchButton = $('#search-button');
var thePoster = $('#poster');
var caption = $('#caption');
var textArea = $('#discussion');
var saveButton = $('#save-button');
var dataPoster;
var dataCaption;

textArea.hide();
saveButton.hide();

searchButton.on('click', function(){
  console.log('clicked')
  movieInput.hide()
  searchButton.hide()
  var requestSettings = {
    method: 'get',
    url: '/search/'+ movieInput.val()
  }
  function callback(data){
    console.log(data.results[0])
    var overview = data.results[0].overview
    var poster = data.results[0].poster_path
    dataCaption = overview
    dataPoster = poster;
    thePoster.append('<img src="https://image.tmdb.org/t/p/w500'+ poster +'" />')
    caption.append(overview)
  }
  $.ajax(requestSettings).done(callback)
  textArea.show();
  saveButton.show();
});

saveButton.on('click',function(e){
  // e.preventDefault();
  // console.log(poster)
  // console.log('<img src="https://image.tmdb.org/t/p/w500'+ dataPoster +'" />');
  picture = "https://image.tmdb.org/t/p/w500"+ dataPoster;
  caption = dataCaption
  console.log(caption)
  console.log(picture)
  var requestSettings = {
    method: 'post',
    url:'/movies/',
    data:JSON.stringify({image: picture, plot: caption}),
    contentType: "application/json"
  }
  function callback(d){

  }
  $.ajax(requestSettings).done(callback)
})
