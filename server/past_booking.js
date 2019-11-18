const request = require("request");
const cheerio = require("cheerio");
const Prompt = require('prompt-password');
const prompt = new Prompt({
   type: 'password',
   message: 'password: ',
   name: 'password',
   mask: '*'
});

const studentID = new Prompt({
   message: 'student id: ',
   name: 'id'
});

let cookie = request.jar();
const url = 'https://rooms.library.dc-uoit.ca/uo_rooms/myreservations.aspx';

function getStateData() {
   return new Promise((resolve, reject) => {
      request.get({
         url: url,
         jar: cookie
      }, (error, response, body) => {
         const $ = cheerio.load(body);
         let data = {};
         $('form#Form1').children("input").each((i, element) => {
            let con = $(element);
            data[con.attr('name')] = con.attr('value');
         });
         resolve(data);
      });
   })
}

function getStudentID() {
   return new Promise(((resolve, reject) => {
      studentID.run().then(answers => {
         console.log(answers);
         resolve(answers);
      });
   }));
}

function getPassword() {
   return new Promise(((resolve, reject) => {
      prompt.run().then((answers) => {
         resolve(answers)
      });
   }))
}

async function x() {
   let data = await getStateData();
   data['ctl00$ContentPlaceHolder1$TextBoxID'] = await getStudentID();
   data['ctl00$ContentPlaceHolder1$TextBoxPassword'] = await getPassword();
   request.post({
      url: url,
      formData: data,
      jar: cookie
   }, (err, res, bod) => {
      let $ = cheerio.load(bod);
      console.log("Current Booking Count: ", $('#ContentPlaceHolder1_TablePast > tbody').children().length - 1)
   })
}

x();
