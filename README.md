# **BackWo**

> A social network to find lost pets integrating features such as user authentication, real-time chat messenger, Google Maps information, image auto labeling, and lost pets matching notification.

https://www.back-wo.com

![](./public/assets/readme/backwo_homepage.png)

## **Test Accounts :**

- Pet Finder :
  - Email : petfinder@gmail.com
  - Password : petfinder
- Pet Owner:
  - Email : petowner@gmail.com
  - Password : petowner

## **Contents**

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Feature Highlights](#feature-highlights)
- [Technologies](#technologies)
- [Contact](#contact)

## **Architecture**

![](https://dxnjy6wff2091.cloudfront.net/readme/backwo_architecture.png)

## **Database Schema**

![](https://dxnjy6wff2091.cloudfront.net/readme/backwo_rds_EERDiagram.png)

## **Feature Highlights**

- **Pets Post Data Visualisation**

  - Showing lost pet post information. All posts will be visualized on Google Map with description info windows.
  - Drag the map or use the filter to break down lost pets’ information.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/view_posts.gif)

- **Image Auto Labeling**

  - Upload a pet post. The main image will be detected and labeled by Amazon Rekognition for unknown pet breeds.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/labeling.gif)

- **Lost Pets Matching and Notification**

  - Lost pets will be matched automatically when pet finders upload a post. And notifications will be updated on the profile page to any potential pet owners.
  - Notifications will be sent through email as well.
  - Pet owners could write a thank-you message to pet finders after matching.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/notifications.gif)

- **Successful Matching Case**

  - Pet finders will get the confirm post on the profile page with a thank-you message from pet owners.
  - After confirming the post and saving the change, the lost post will be removed and show the successful case on the home page.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/successmatch.gif)

- **Chat Room Message**

  - Send real-time messages to other users in a private chat room.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/chatmessage.gif)

- **Adopt Pets Information**

  - Adopt pets information will be updated through government open data API and scheduled cron jobs daily by crontab.

  ![](https://dxnjy6wff2091.cloudfront.net/readme/adopts.gif)

## **Technologies**

### **Back-End**

- Node.js
- Express.js
- RESTful APIs
- Nginx

### **Front-End**

- HTML
- CSS
- JavaScript

### **Database**

- MySQL

### **Web Socket**

- Socket&#46;IO

### **Cloud Service (AWS)**

- Elastic Compute Cloud (EC2)
- Simple Storage Service (S3)
- Relational Database Service (RDS)
- Rekognition
- CloudFront

### **Networking**

- HTTPS
- SSL
- Domain Name System (DNS)

### **3rd Party APIs**

- Facebook Login API
- Google Maps APIs
- Open Data APIs

### **Test**

- Mocha
- Chai

## **Contact**

Vinny Tsai | tsai.vinny@gmail.com
