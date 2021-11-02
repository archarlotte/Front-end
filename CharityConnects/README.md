# COMP9900 capstone project -- Warriors

## Project name

**Charity Connect**

#### Description

The purpose of our project is to provide a non-profit website that allows charities to post their needs and attracts sponsors to provide help for charities. Charities can register, post their information, define needs, get recommendations, and communicate with sponsors. Sponsors can register, post their information, define needs, search charities, and communicate with charities. Through our website, charities and sponsors can get easy access to build connections. 

## Team members

Yunfei Cui 

Jiabao Ju

Qilin Zhong

Xiaole Du

Xueting Ke

## Prerequisite

**Backend:** Python: 3.7

**Frontend:** yarn / npm

## Dtabase setting

We use AWS to create RDS and save our data in cloud.

If database is required to evaluate, please contact our team member.

## How to run

### Run through IP address

We deployed our website on the server. You can just simply and use our services by clicking the link http://charityconnects.com/ directly.

### Run on the local environment

#### Download and Initialization
1. Clone the code on your local environment:
`git clone https://github.com/COMP3900-9900-Capstone-Project/capstoneproject-comp9900-w18b-warriors.git`

2. Install python3.7 in the local environment

3. Install Node.js in the local environment

4. Install npm and yarn in the local environment

#### Run frontend part

1. Go to /front-end/charity/

2. Run: `yarn install` / `npm install`

3. Run: `yarn build` / `npm run build`

4. Run: `yarn start` / `npm start`

5. Before using our services like login or register, you should open and run the backend first because database connection is required.

#### Run backend part

1. Go to /back-end/

2. Install all required packages: `pip3 install -r requirements.txt`

3. Run: `Python3 app.py`

4. After run app.py, you can run frontend part.
