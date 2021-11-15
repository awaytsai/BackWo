const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const Noti = require("../model/notification_model");
const { getPhotoPath } = require("../util/util");

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// const rule = "*/1 * * * *";
const rule = "1 * * * *";
// scheduling for monute is 1;

const job = schedule.scheduleJob(rule, async () => {
  // 1. sending notification
  const notiMailData = await Noti.getNotiMailData();
  if (notiMailData.length == 0) {
    return console.log("nothing to update");
  }
  const notiMailPhoto = await Noti.getNotiMailPhoto();
  getPhotoPath(notiMailPhoto, "findowners");
  for (let i = 0; i < notiMailData.length; i++) {
    notiMailData[i].photo = notiMailPhoto[i].photo;
  }
  console.log(notiMailData);
  const notiMailResponse = await notiMail(notiMailData);
  console.log("mail sended");
  // update mail status
  const notiIds = [];
  notiMailData.map((data) => notiIds.push(data.n_id));
  console.log(notiIds);
  const updateMailStatus = await Noti.updateNotiMailStatus(notiIds);
  console.log(updateMailStatus);
});

// const ruleMatch = "*/1 * * * *";
const ruleMatch = "2 * * * *";
// scheduling for monute is 2;

const jobMatch = schedule.scheduleJob(ruleMatch, async () => {
  // 2. sending confirm post
  const matchMailData = await Noti.getMatchMailData();
  if (matchMailData == 0) {
    return console.log("nothing to update");
  }
  console.log(matchMailData);
  const senderData = await Noti.getMatchSenderData();
  console.log(senderData);
  const matchIds = [];
  matchMailData.map((data) => {
    matchIds.push(data.mid);
  });
  console.log(matchIds);
  // send email
  const matchMailResponse = await matchMail(matchMailData, senderData);
  console.log("mail sended");
  const updateMatchMailStatus = await Noti.updateMatchMailStatus(matchIds);
  console.log(updateMatchMailStatus);
  console.log("updated");
});

async function notiMail(data) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER, // generated ethereal user
        pass: process.env.MAIL_PASS, // generated ethereal password
      },
    });

    for (let i = 0; i < data.length; i++) {
      let info = await transporter.sendMail({
        from: `"Back-Wo" <${process.env.MAIL_USER}>`, // sender address
        to: `${data[i].email}`,
        subject: `《 Back-Wo 寵物協尋 🐶 通知 》`, // Subject line
        html: `
                <html>
                <head>
                    <style>
                        .link{
                            margin: 10px 0;
                            padding: 10px;
                            text-decoration: none;
                            color: #fff;
                            font-weight: bold;
                            background-color: #f0f0f0;
                            border-radius: 10px;
                        }
                        .wrap{
                            display: flex;
                        }
                        .photo{
                          width:300px;
                        }
                    </style>
                </head>
                <body>
                    <h3>Hello ${data[i].name}，你的個人頁面有一則新通知，有人找到的可能是你的寵物，點擊下方查看貼文確認。</h3>
                    <img class="photo" src="${data[i].photo}">
                    <div class="wrap">
                        <a class="link" href="${process.env.DOMAIN}/profile">個人頁面</a>
                        <a class="link" href="${process.env.DOMAIN}/findowners/detail.html?id=${data[i].f_id}">貼文連結</a>
                    </div>
                </body>
                </html>
                `,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

async function matchMail(data, sender) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER, // generated ethereal user
        pass: process.env.MAIL_PASS, // generated ethereal password
      },
    });

    for (let i = 0; i < data.length; i++) {
      let info = await transporter.sendMail({
        from: `"Back-Wo" <${process.env.MAIL_USER}>`, // sender address
        to: `${data[i].email}`,
        subject: `《 Back-Wo 寵物協尋 🐶 通知 》`, // Subject line
        html: `
                  <html>
                  <head>
                      <style>
                          .link{
                              margin: 10px 0;
                              padding: 10px;
                              text-decoration: none;
                              color: #fff;
                              font-weight: bold;
                              background-color: #f0f0f0;
                              border-radius: 10px;
                          }
                          .wrap{
                              display: flex;
                          }
                          .sender img{
                            width:35px;
                            heigth: 35px;
                          }
                      </style>
                  </head>
                  <body>
                      <h3>Hello ${data[i].name}，您的個人頁面有一則新通知，有飼主提出確認。請點選下方連結，回到個人頁面的「待確認貼文」做確認。</h3>
                      <p class="sender">飼主: <img src="${sender[i].picture}">${sender[i].name}</p>
                      <p>感謝留言: ${data[i].thank_message}</p>
                      <div class="wrap">
                          <a class="link" href="${process.env.DOMAIN}/profile.html">個人頁面</a>
                      </div>
                  </body>
                  </html>
                  `,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// const getmail = async (req, res) => {
//   // 1. sending notification
//   const notiMailData = await Noti.getNotiMailData();
//   if (notiMailData.length == 0) {
//     return console.log("nothing to update");
//   }
//   const notiMailPhoto = await Noti.getNotiMailPhoto();
//   getPhotoPath(notiMailPhoto, "findowners");
//   for (let i = 0; i < notiMailData.length; i++) {
//     notiMailData[i].photo = notiMailPhoto[i].photo;
//   }
//   console.log(notiMailData);
//   const notiMailResponse = await notiMail(notiMailData);
//   console.log("mail sended");
//   // update mail status
//   const notiIds = [];
//   notiMailData.map((data) => notiIds.push(data.n_id));
//   console.log(notiIds);
//   const updateMailStatus = await Noti.updateNotiMailStatus(notiIds);
//   console.log("4");
//   // console.log(updateMailStatus);
//   res.json({ status: "ok" });
// };

// const getMatchmail = async (req, res) => {
//   // 2. sending confirm post
//   const matchMailData = await Noti.getMatchMailData();
//   if (matchMailData == 0) {
//     return console.log("nothing to update");
//   }
//   console.log("5");
//   console.log(matchMailData);
//   const senderData = await Noti.getMatchSenderData();
//   console.log("6");
//   console.log(senderData);
//   const matchIds = [];
//   matchMailData.map((data) => {
//     matchIds.push(data.mid);
//   });
//   console.log("7");
//   console.log(matchIds);
//   // send email
//   const matchMailResponse = await matchMail(matchMailData, senderData);
//   console.log("mail sended");
//   // const updateMatchMailStatus = await Noti.updateMatchMailStatus(matchIds);
//   console.log("8");
//   // console.log(updateMatchMailStatus);
//   console.log("updated");

//   res.json({ status: "ok" });
// };
// module.exports = { getmail, getMatchmail };
