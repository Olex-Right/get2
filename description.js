const axios = require('axios')
const cheerio = require('cheerio');
const fs = require("fs");
const db = require('./db/stack.json');
const sleep = require('util').promisify(setTimeout);


// async function getDescription(){
  
//   let users = db
//   for(let i = 0; i < users.length; i++){
//     const link = users[i].link.toString()
//     // console.log(link)
//     const $ = await getHTML(link)
//   }
// }
// getDescription()

let total = [];

function validateEmail(email) {
  let result = [];
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let words = email.split(' ')
  words.forEach(word => {
    if(re.test(String(word).toLowerCase())){
      result.push(word)
    }
  });
  let httpResult = validateHttps(email);
  httpResult.forEach(a => {
    result.push(a)
  })
  
  return result 
}
function validateHttps(email){
  let result = [];
  let re = /(https?:\/\/[^\s]+)/g
  let words = email.split(' ')
  words.forEach(word => {
    if(re.test(String(word).toLowerCase())){
      result.push(word)
    }
  });
  return result
}



const parse = async () => {
  const getHtml = async (url) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
  };
  


  for(let i = 0; i < db.length; i++){
    //inner functions
    const getSocials = async () => {
      let a = $('[rel^="me"]')
      let b = [];
      for(let i = 0; i < a.length; i++){
        let thisA = a[i]
        if($(thisA).attr('href') == false){
        }else{
          b.push($(thisA).attr('href'))
        }
      }
      return b    
    }

    const getTags = async () => {
      if($('[rel="tag"]') == null){
        return []
      }
      let result = []
      let tagsMassive = $('[rel="tag"]');
      
      for(let i = 0; i < tagsMassive.length; i++){
        result.push($(tagsMassive[i]).text()) ;
      }

      return result;
    }


    //main code in function

    const link = db[i].link
    const $ = await getHtml(link);
    let description = ''
    if($('.profile-user--bio') == null || $('.profile-user--bio').text() == false || $('.profile-user--bio').text().includes('Apparently, this user prefers to keep')){
    }else{
      description = $('.profile-user--bio').text()
    }
    description = description.replace(/\n/g,' ');
    description = (validateEmail(description));

    let socials = await getSocials();

    let tags = await getTags()

    const info = {link, description, socials, tags};
    if(info.description == false && socials == false) {
    } else{
      total.push(info);
      console.log(i, 'pushed');
    }
    
    console.time("Slept for")
    await sleep(1500)
    console.timeEnd("Slept for")
  }     

  fs.appendFile("./db/socials.json", JSON.stringify(total), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}
parse()