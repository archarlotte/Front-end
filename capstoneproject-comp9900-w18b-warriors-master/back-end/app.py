from collections import Counter
from flask import Flask, request, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime, func
from flask_cors import CORS
import re
from flask_restx import Api, Resource
import hashlib


class Config_db(object):
    """config"""
    SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://admin:12345678@database-9900.ckptjynecy5j.ap-southeast-2.rds.amazonaws.com:3306/project_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = True


app = Flask(__name__)
api = Api(app,
          default="Methods",
          title="Charity Connect api",
          version="1.0",
          default_label="Methods to access data",
          description="This is a charity and sponsor website backend")

CORS(app, supports_credentials=True)
app.config.from_object(Config_db)
db = SQLAlchemy(app)


# db.init_app(app)


class Charity(db.Model):
    """
    this is charity table
    --- charity_id
    --- email
    --- name
    --- password
    --- description
    """
    __tablename__ = 'charity'
    cid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(250), nullable=True)


class Sponsor(db.Model):
    """
    this is Sponsor table
    --- sponsor_id
    --- email
    --- name
    --- password
    --- description
    --- link
    """
    __tablename__ = 'sponsor'
    sid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    link = db.Column(db.String(50), nullable=True)


class Need(db.Model):
    """
    this is Need table
    --- name
    """
    __tablename__ = 'Need'
    nid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=True)


class sp_Need(db.Model):
    """
    this is Sponsor_Need table
    --- id
    --- name (needs)
    --- sponsor_id
    --- is_valid
    """
    __tablename__ = 'sp_Need'
    sp_need_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    need_id = db.Column(db.Integer, db.ForeignKey('Need.nid'))
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsor.sid'))
    is_valid = db.Column(db.Integer, default=1)


class ch_Need(db.Model):
    """
    this is Charity_Need table
    --- id
    --- name (needs)
    --- charity_id
    --- is_valid
    """
    __tablename__ = 'ch_Need'
    ch_need_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    need_id = db.Column(db.Integer, db.ForeignKey('Need.nid'))
    charity_id = db.Column(db.Integer, db.ForeignKey('charity.cid'))
    is_valid = db.Column(db.Integer, default=1)


class sp_ch(db.Model):
    """
    this is sp_ch table
    --- id
    --- sp_id
    --- ch_id
    --- content
    --- is_connected( 1 waiting ； 2 accept；3 decline)
    --- direction (the direction of mail; 1: sp-->ch; 2:ch-->sp)
    --- create_time
    --- update_time
    """
    __tablename__ = 'sp_ch'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sp_id = db.Column(db.Integer, db.ForeignKey('sponsor.sid'))
    ch_id = db.Column(db.Integer, db.ForeignKey('charity.cid'))
    content = db.Column(db.String(50), nullable=True)
    is_connected = db.Column(db.Integer, default=1)
    direction = db.Column(db.Integer)
    create_time = db.Column(DateTime, server_default=func.now())
    update_time = db.Column(DateTime, server_default=func.now(), onupdate=func.now())


# namespace
user_ns = api.namespace('User_Account', path='/user', description='user login / register')
profile_ns = api.namespace('Profile', path='/profile', description='get charity profile / update profile')
search_ns = api.namespace('Search', path='/search',
                          description='The sponsors could find charities they think they can help through '
                                      'searching by keywords that match on any combination of charity name, '
                                      'description, and/or needs.')
communication_ns = api.namespace('Communication', path='/communication',
                                 description='communication between charity and sponsor')
recommendation_ns = api.namespace('Recommendation', path='/recommend',
                                  description='recommend to registered charities a list of sponsors '
                                              'that have the potential to help')
homepage_ns = api.namespace('Homepage', path='/homepage',
                            description='the homepage')


@app.route('/init')
def hello_world():
    # db.drop_all()
    # db.create_all()
    return 'Hello World!'


@app.route('/initdata')
def init_data():
    #     db.drop_all()
    #     db.create_all()
    #     init_db_data()
    return 'Init DB OK!'


# -----------------------------------
# LOGIN page
# --- login success
# --- password is incorrect
# --- email does not exist
# -----------------------------------
@user_ns.route('/login')
class Login(Resource):
    @user_ns.response(400, str({'message': 'Login fail: account doesnt exist'}))
    @user_ns.response(404, str({'message': 'Login fail: password does not match'}))
    @user_ns.response(200, str({'role': '1(charity) / 2(charity)', 'message': 'account already exists'}))
    @api.param('password', 'the password of user')
    @api.param('email', 'the email of user')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["email"]
        pwd = content["password"]

        # Determine whether the account and password are correct or not
        pwd = hashlib.md5(pwd.encode()).hexdigest()
        charity = Charity.query.filter_by(email=email, password=pwd).first()
        sponsor = Sponsor.query.filter_by(email=email, password=pwd).first()

        if charity:
            response = {
                "role": "1",
                "message": "success"
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify({"role": "1"}), 200
        elif sponsor:
            response = {
                "role": "2",
                "message": "success"
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify({"role": "2"}), 200
        else:
            # check whether the email exists
            acc_charity_email = Charity.query.filter_by(email=email).first()
            acc_sponsor_email = Sponsor.query.filter_by(email=email).first()
            if acc_charity_email or acc_sponsor_email:
                response = {
                    "message": "Login fail: password does not match"
                }
                resp = make_response(response)
                resp.status_code = 404
                return resp
                # return jsonify(success=False, message='Login fail: password does not match!!!'), 404
            else:
                response = {
                    "message": "Login fail: account doesnt exist"
                }
                resp = make_response(response)
                resp.status_code = 400
                return resp
                # return jsonify(success=False, message='Login fail: account doesnt exist!!!'), 400


# -----------------------------------
# REGISTER page
# --- two passwords are not same
# --- email already exists
# --- register success and add account to db
# -----------------------------------
@user_ns.route('/register')
class Register(Resource):
    @user_ns.response(409, str({'message': 'Register fail: password confirmation error'}))
    @user_ns.response(400, str({'message': 'Register fail: the format of email error'}))
    @user_ns.response(201, str({'role': '1 / 2', 'message': 'success'}))
    @user_ns.response(200, str({'message': 'account already exists'}))
    @api.param('role', '1(charity) / 2(sponsor)')
    @api.param('password2', 'the confirm password of user')
    @api.param('password1', 'the password of user')
    @api.param('email', 'the email of user')
    @api.param('name', 'the name of user')
    def post(self):
        # Get parameters
        content = request.get_json()
        name = content["name"]
        email = content["email"]
        pwd1 = content["password1"]
        pwd2 = content["password2"]
        role = content["role"]

        # if two passwords are not same
        if pwd1 != pwd2:
            response = {
                "message": "Register fail: password confirmation error"
            }
            resp = make_response(response)
            resp.status_code = 409
            return resp
            # return jsonify(success=False, message='Register fail: password confirmation error'), 409

        if not check_email(email):
            response = {
                "message": "Register fail: the format of email error"
            }
            resp = make_response(response)
            resp.status_code = 400
            return resp
            # return jsonify(success=False, message='Register fail: the format of email error'), 400

        # check whether the email exists
        acc_charity_email = Charity.query.filter_by(email=email).first()
        acc_sponsor_email = Sponsor.query.filter_by(email=email).first()

        # email already exists
        if acc_charity_email or acc_sponsor_email:
            response = {
                "message": "account already exists"
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify(success=True, message='account already exists'), 200
        # create an account
        else:
            if role == '1':
                pwd1 = hashlib.md5(pwd1.encode()).hexdigest()
                new_account = Charity(name=name, email=email, password=pwd1)
                # add the new account to db
                db.session.add(new_account)
                db.session.commit()
                response = {
                    "role": "1",
                    "message": "success"
                }
                resp = make_response(response)
                resp.status_code = 201
                return resp
                # return jsonify({"role": "1"}), 201
            else:
                pwd1 = hashlib.md5(pwd1.encode()).hexdigest()
                new_account = Sponsor(name=name, email=email, password=pwd1)
                # add the new account to db
                db.session.add(new_account)
                db.session.commit()
                response = {
                    "role": "2",
                    "message": "success"
                }
                resp = make_response(response)
                resp.status_code = 201
                return resp
                # return jsonify({"role": "2"}), 201
            # return jsonify(success=True, message='Register success'), 200


# check the format of the email
def check_email(email):
    if re.match("^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$", email) is not None:
        return True
    else:
        return False


# -----------------------------------
# CHARITY PROFILE page
# --- name, description, needs, current_sponsor
# -----------------------------------
@profile_ns.route('/charity')
class CharityProfile(Resource):
    @profile_ns.response(400, str({"message": "No charity is found by the email"}))
    @profile_ns.response(200, str({"name": "eg. GoodCharity",
                                   "description": "eg. a company ...",
                                   "needs": "eg. [clothes, laptop]",
                                   "newDefine": 'broccoli',
                                   "connectedSponsor": "eg. [Sponsor1, Sponsor2]",
                                   "message": "success"}))
    @api.param('email', 'the email of charity')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["email"]
        default_needs = ["foods", "clothes", "shoes", "laptops", "books", "toys"]
        # email = request.args.get('email')
        # Determine whether the charity exists
        charity = Charity.query.filter(Charity.email == email).first()
        if charity:
            needs_id_list = []
            # get the charity's ID
            the_ID = charity.cid
            # deal with needs
            needs_res = ch_Need.query.filter(ch_Need.charity_id == the_ID, ch_Need.is_valid == 1).all()
            defineNeed = ''
            for item in needs_res:
                if item.ch_need_id in needs_id_list:
                    pass
                else:
                    needs_id_list.append(item.need_id)
            needs_name_res = Need.query.filter(Need.nid.in_(needs_id_list)).all()
            needs_list = []
            for item in needs_name_res:
                if item.name in default_needs:
                    needs_list.append(item.name)
                else:
                    defineNeed = item.name

            # deal with related sponsors
            sponsor_list = []
            sponsor_res = sp_ch.query.filter(sp_ch.ch_id == the_ID, sp_ch.is_connected == 2).all()
            for item in sponsor_res:
                name_res = Sponsor.query.filter(Sponsor.sid == item.sp_id).first()
                if name_res is None:
                    continue
                sponsor_list.append(name_res.name)

            response = {
                "name": charity.name,
                "description": charity.description,
                "needs": needs_list,
                "newDefine": defineNeed,
                "connectedSponsor": sponsor_list,
                "message": "success",
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify(success=True, username=charity.username, description=charity.description,
            #                needs=charity.needs, current_sponsor=charity.current_sponsor), 200
        else:
            response = {
                "message": "No charity is found by email"
            }
            resp = make_response(response)
            resp.status_code = 400
            return resp
            # return jsonify(success=False, message='No charity is found which email is {}!!!'.format(email)), 400


# -----------------------------------
# SPONSOR PROFILE page
# --- name, description, needs, link
# -----------------------------------
@profile_ns.route('/sponsor')
class SponsorProfile(Resource):
    @profile_ns.response(400, str({"message": "No sponsor is found by the email"}))
    @profile_ns.response(200, str({"name": "eg. GoodSponsor",
                                   "description": "eg. a company ...",
                                   "needs": "eg. [clothes, laptop]",
                                   "newDefine": "broccoli",
                                   "message": "success"}))
    @api.param('email', 'the email of sponsor')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["email"]
        default_needs = ["foods", "clothes", "shoes", "laptops", "books", "toys"]
        # email = request.args.get('email')
        # Determine whether the charity exists
        sponsor = Sponsor.query.filter(Sponsor.email == email).first()
        if sponsor:
            needs_id_list = []
            the_ID = sponsor.sid
            # deal with needs
            needs_res = sp_Need.query.filter(sp_Need.sponsor_id == the_ID, sp_Need.is_valid == 1).all()
            defineNeed = ''
            sp_needID_list = []
            for item in needs_res:
                sp_needID_list.append(item.sp_need_id)
                if item.sp_need_id in needs_id_list:
                    pass
                else:
                    needs_id_list.append(item.need_id)
            needs_name_res = Need.query.filter(Need.nid.in_(needs_id_list)).all()
            needs_list = []
            for item in needs_name_res:
                if item.name in default_needs:
                    needs_list.append(item.name)
                else:
                    defineNeed = item.name

            response = {
                "name": sponsor.name,
                "description": sponsor.description,
                "needs": needs_list,
                "newDefine": defineNeed,
                "message": "success",
                "link": sponsor.link
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify(success=True, username=sponsor.username, description=sponsor.description,
            #                needs=sponsor.needs, link=sponsor.link), 200
        else:
            response = {
                "message": "No sponsor is found by email",
            }
            resp = make_response(response)
            resp.status_code = 400
            return resp
            # return jsonify(success=False, message='No sponsor is found which email is {}!!!'.format(email)), 400


# -----------------------------------
# edit CHARITY PROFILE page
# --- name, description, needs
# -----------------------------------
@profile_ns.route('/charity/change')
class CharityProfileEdit(Resource):
    @profile_ns.response(400, str({"message": "No charity is found by the email"}))
    @profile_ns.response(200, str({"message": "Edit success"}))
    @api.param('defineNeed', 'the new defined need of charity (can be null)')
    @api.param('thirdNeed', 'the 3rd need of charity (can be null)')
    @api.param('secondNeed', 'the 2nd need of charity (can be null)')
    @api.param('firstNeed', 'the 1st need of charity (can be null)')
    @api.param('description', 'the description of charity (can be null)')
    @api.param('name', 'the name of charity')
    @api.param('email', 'the email of charity')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["email"]
        name = content["name"]
        description = content["description"]
        first_need = content["firstNeed"]
        second_need = content["secondNeed"]
        third_need = content["thirdNeed"]
        define_need = content["defineNeed"]

        # Determine whether the account exists
        charity = Charity.query.filter(Charity.email == email).first()
        if charity:
            # Determine whether name changed
            # if name == charity.name and description == charity.description and needs == charity.needs:
            #     return jsonify(success=False, message='Nothing changes!!!'), 400
            # Determine whether name, description and needs are none

            charity.description = description
            charity.name = name
            db.session.commit()
            # deal with "needs"
            the_ID = charity.cid

            # make old needs 'is_valid' to 0
            valid_needs = ch_Need.query.filter(ch_Need.charity_id == the_ID, ch_Need.is_valid == 1).all()
            all_new_needs = [first_need, second_need, third_need]
            all_old_needs = []
            for item in valid_needs:
                need = Need.query.filter(Need.nid == item.need_id).first()
                all_old_needs.append(need.name)
                if need.name not in all_new_needs:
                    # do not need it
                    item.is_valid = 0
                db.session.commit()

            if first_need != 'None' and first_need != '':
                if first_need not in all_old_needs:
                    need_1 = Need.query.filter(Need.name == first_need).first()
                    ch_need_1 = ch_Need(need_id=need_1.nid, charity_id=the_ID)
                    db.session.add(ch_need_1)
                    db.session.commit()
            if second_need != 'None' and second_need != '':
                if second_need not in all_old_needs:
                    need_2 = Need.query.filter(Need.name == second_need).first()
                    ch_need_2 = ch_Need(need_id=need_2.nid, charity_id=the_ID)
                    db.session.add(ch_need_2)
                    db.session.commit()
            if third_need != 'None' and third_need != '':
                if third_need not in all_old_needs:
                    need_3 = Need.query.filter(Need.name == third_need).first()
                    ch_need_3 = ch_Need(need_id=need_3.nid, charity_id=the_ID)
                    db.session.add(ch_need_3)
                    db.session.commit()
            if define_need != 'None' and define_need != '':
                if define_need not in all_old_needs:
                    need = Need.query.filter(Need.name.contains(remove_s(define_need))).first()
                    if need:
                        ch_need_4 = ch_Need(need_id=need.nid, charity_id=the_ID)
                        db.session.add(ch_need_4)
                        db.session.commit()
                    else:
                        need_4 = Need(name=define_need)
                        db.session.add(need_4)
                        db.session.commit()
                        need_id = Need.query.filter(Need.name == define_need).first()
                        ch_need_4 = ch_Need(need_id=need_id.nid, charity_id=the_ID)
                        db.session.add(ch_need_4)
                        db.session.commit()

            response = {
                "message": "Update profile success",
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify(success=True, message='Update profile success'), 200
        else:
            response = {
                "message": "No charity is found by the email",
            }
            resp = make_response(response)
            resp.status_code = 400
            return resp
            # return jsonify(success=False, message='No charity is found which email is {}!!!'.format(email)), 400


# -----------------------------------
# edit SPONSOR PROFILE page
# --- name, description, needs, link
# -----------------------------------
@profile_ns.route('/sponsor/change')
class SponsorProfileEdit(Resource):
    @profile_ns.response(400, str({"message": "No sponsor is found by the email"}))
    @profile_ns.response(200, str({"message": "Edit success"}))
    @api.param('link', 'the link of sponsor (can be null)')
    @api.param('defineNeed', 'the new defined need of sponsor (can be null)')
    @api.param('thirdNeed', 'the 3rd need of sponsor (can be null)')
    @api.param('secondNeed', 'the 2nd need of sponsor (can be null)')
    @api.param('firstNeed', 'the 1st need of sponsor (can be null)')
    @api.param('description', 'the description of sponsor (can be null)')
    @api.param('name', 'the name of sponsor')
    @api.param('email', 'the email of sponsor')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["email"]
        name = content["name"]
        description = content["description"]
        first_need = content["firstNeed"]
        second_need = content["secondNeed"]
        third_need = content["thirdNeed"]
        define_need = content["defineNeed"]
        link = content["link"]

        # Determine whether the account exists
        sponsor = Sponsor.query.filter(Sponsor.email == email).first()
        if sponsor:
            # Determine whether name changed
            # if name == charity.name and description == charity.description and needs == charity.needs:
            #     return jsonify(success=False, message='Nothing changes!!!'), 400
            # Determine whether name, description and needs are none
            sponsor.description = description
            sponsor.name = name
            sponsor.link = link
            db.session.commit()
            # deal with "needs"
            the_ID = sponsor.sid

            # make old needs 'is_valid' to 0
            valid_needs = sp_Need.query.filter(sp_Need.sponsor_id == the_ID, sp_Need.is_valid == 1).all()
            all_new_needs = [first_need, second_need, third_need]
            all_old_needs = []
            for item in valid_needs:
                need = Need.query.filter(Need.nid == item.need_id).first()
                all_old_needs.append(need.name)
                if need.name not in all_new_needs:
                    # do not need it
                    item.is_valid = 0
                db.session.commit()

            for i in all_new_needs:
                if i != '' and i != 'None' and i not in all_old_needs:
                    need_res = Need.query.filter(Need.name == i).first()
                    sp_need = sp_Need(need_id=need_res.nid, sponsor_id=the_ID)
                    db.session.add(sp_need)
                    db.session.commit()

            if define_need != '' and define_need not in all_old_needs:
                need = Need.query.filter(Need.name.contains(remove_s(define_need))).first()
                if need:
                    sp_need_4 = sp_Need(need_id=need.nid, sponsor_id=the_ID)
                    db.session.add(sp_need_4)
                    db.session.commit()
                else:
                    need_4 = Need(name=define_need)
                    db.session.add(need_4)
                    db.session.commit()
                    need_id = Need.query.filter(Need.name == define_need).first()
                    sp_need_4 = sp_Need(need_id=need_id.nid, sponsor_id=the_ID)
                    db.session.add(sp_need_4)
                    db.session.commit()

            response = {
                "message": "Update profile success"
            }
            resp = make_response(response)
            resp.status_code = 200
            return resp
            # return jsonify(success=True, message='Update profile success'), 200
        else:
            response = {
                "message": "No sponsor is found by the email"
            }
            resp = make_response(response)
            resp.status_code = 400
            return resp
            # return jsonify(success=False, message='No sponsor is found which email is {}!!!'.format(email)), 400


# -----------------------------------
# Platform Info page
# --- return top 10 sponsors, the number of connected charities of this sponsor
# -----------------------------------
@homepage_ns.route('/biggestsponsor')
class biggestsponsor(Resource):
    @profile_ns.response(200, str({'message': 'success',
                                   "data": [{"id": 1, "name": "AUS MED", "email": "ausmed@gmail.com",
                                             "description": "aussie's medication center", "num": "10"},
                                            {"id": 2, "name": "Sydney breast cancer", "email": "ausmed@gmail.com",
                                             "description": "Sydney breast cancer as sponsor", "num": "8"}
                                            ]}))
    def get(self):
        sponsor_res = Sponsor.query.all()
        data = []
        sponsor_num = {}
        sponsor_data_total = {}
        for sponsor in sponsor_res:
            sponsor_data = {}
            sp_ch_res = db.session.query(sp_ch.ch_id).filter(sp_ch.sp_id == sponsor.sid,
                                                             sp_ch.is_connected == 2).distinct().count()
            sponsor_data["id"] = sponsor.sid
            sponsor_data["name"] = ''
            sponsor_data["email"] = ''
            sponsor_data["description"] = ''
            if sponsor.name != None:
                sponsor_data["name"] = sponsor.name
            if sponsor.email != None:
                sponsor_data["email"] = sponsor.email
            if sponsor.description != None:
                sponsor_data["description"] = sponsor.description
            sponsor_data["num"] = sp_ch_res
            sponsor_num[sponsor.sid] = sp_ch_res
            sponsor_data_total[sponsor.sid] = sponsor_data
        sponsor_num_sort = sorted(sponsor_num.items(), key=lambda x: x[1], reverse=True)
        total_ten = 1
        for sort_spon in sponsor_num_sort:
            if total_ten > 10:
                break
            sponsor_data = sponsor_data_total[sort_spon[0]]
            data.append(sponsor_data)
            total_ten += 1
        response = {
            "data": data,
            "message": "success"
        }
        resp = make_response(response)
        resp.status_code = 200
        return resp


# -----------------------------------
# BIGGEST SPONSOR PROFILE page
# --- name, description, needs, link, is_connected
# -----------------------------------
@profile_ns.route('/sponsor/biggestsponsor/details')
class SponsorProfile(Resource):
    @profile_ns.response(400, str({"message": "No sponsor is found by the email"}))
    @profile_ns.response(200, str({"name": "eg. GoodSponsor",
                                   "description": "eg. a company ...",
                                   "needs": "eg. [clothes, laptop]",
                                   "newDefine": "broccoli",
                                   "link": "www.xxx.com",
                                   "is_connected": "1/2/3/not connected",
                                   "message": "success"}))
    @api.param('charity_email', 'the email of charity')
    @api.param('sponsor_email', 'the email of sponsor')
    def post(self):
        # Get parameters
        content = request.get_json()
        email = content["sponsor_email"]
        charity_email = content["charity_email"]
        default_needs = ["foods", "clothes", "shoes", "laptops", "books", "toys"]
        # email = request.args.get('email')
        # Determine whether the charity exists
        sponsor = Sponsor.query.filter(Sponsor.email == email).first()
        needs_id_list = []
        the_ID = sponsor.sid
        # deal with needs
        needs_res = sp_Need.query.filter(sp_Need.sponsor_id == the_ID, sp_Need.is_valid == 1).all()
        defineNeed = ''
        sp_needID_list = []
        for item in needs_res:
            sp_needID_list.append(item.sp_need_id)
            if item.sp_need_id in needs_id_list:
                pass
            else:
                needs_id_list.append(item.need_id)
        needs_name_res = Need.query.filter(Need.nid.in_(needs_id_list)).all()
        needs_list = []
        for item in needs_name_res:
            if item.name in default_needs:
                needs_list.append(item.name)
            else:
                defineNeed = item.name

        # deal with 'is_connected'
        charity = Charity.query.filter(Charity.email == charity_email).first()
        if charity:
            charity_id = charity.cid
            conn = sp_ch.query.filter(sp_ch.sp_id == the_ID, sp_ch.ch_id == charity_id).first()
            if conn:
                details = conn.is_connected
            else:
                details = 'not connected'
        else:
            details = 100

        response = {
            "name": sponsor.name,
            "description": sponsor.description,
            "needs": needs_list,
            "newDefine": defineNeed,
            "message": "success",
            "link": sponsor.link,
            "is_connected": details
        }
        resp = make_response(response)
        resp.status_code = 200
        return resp


# a function remove plural forms of words
def remove_s(item):
    if item.endswith('s'):
        item = item[:-1]
    return item


# -----------------------------------
# sponsor SEARCH CHARITY page
# by three keywords
# --- name (can be null)
# --- description (can be null)
# --- needs (can be null)
# return a list of email
# -----------------------------------
@search_ns.route('/charity')
class SearchCharity(Resource):
    @api.param('needs', 'what kinds of needs the sponsor can provide (can be null)')
    @api.param('description', 'the description of charity (can be null)')
    @api.param('name', 'the name of charity (can be null)')
    @api.param('email', 'the email of sponsor (cannot be null')
    @profile_ns.response(400, str({"message": "Search failed: there is no result"}))
    @profile_ns.response(200, str({"information": [{"name": "GoodCharity",
                                                    "email": "111@gmail.com",
                                                    "description": "...",
                                                    "needs": ["clothes", "laptops"],
                                                    "is_connected": "1/2/3/not connected"}]}))
    def post(self):
        # Get parameters
        content = request.get_json()
        name = content["name"]
        description = content["description"]
        needs = content["needs"]
        email = content["email"]

        # remove plural forms
        name = remove_s(name)
        needs = remove_s(needs)

        l = []
        response = {
            "information": l
        }

        sponsor = Sponsor.query.filter(Sponsor.email == email).first()
        theID = sponsor.sid

        # three keywords are all null
        # X name, X description, X needs
        # return all account in database
        if name == '' and description == '':
            charity_res = Charity.query.all()  # a list [charity1, charity2, ...]
            # exists matched account
            if charity_res:
                if needs == '':
                    l = search_no_needs(charity_res, theID)
                    response["information"] = l
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
                else:
                    l = search_with_needs(charity_res, needs, theID)
                    if len(l) > 0:
                        response["information"] = l
                        resp = make_response(response)
                        resp.status_code = 200
                    # no matched needs
                    else:
                        response = {
                            "message": "Search failed: there is no result"
                        }
                        resp = make_response(response)
                        resp.status_code = 400
                    return resp
            # no result
            else:
                response = {
                    "message": "Search failed: there is no result"
                }
                resp = make_response(response)
                resp.status_code = 400
                return resp

        # name, description, needs?
        if name != '' and description != '':
            # a list [charity1, charity2, ...]
            name_desc_res = Charity.query.filter(
                Charity.name.contains(name), Charity.description.contains(description)).all()
            if name_desc_res:
                # name, description, needs
                if needs != '':
                    # all matched charity above in ch_Need table
                    l = search_with_needs(name_desc_res, needs, theID)
                    if len(l) > 0:
                        response["information"] = l
                        resp = make_response(response)
                        resp.status_code = 200
                    # no matched needs
                    else:
                        response = {
                            "message": "Search failed: there is no result"
                        }
                        resp = make_response(response)
                        resp.status_code = 400
                    return resp
                # name, description, X needs
                else:
                    l = search_no_needs(name_desc_res, theID)
                    response["information"] = l
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
            else:
                response = {
                    "message": "Search failed: there is no result"
                }
                resp = make_response(response)
                resp.status_code = 400
                return resp
        else:
            # X name, description, needs?
            if description != '':
                desc_res = Charity.query.filter(Charity.description.contains(description)).all()
                if desc_res:
                    # X name, description, needs
                    if needs != '':
                        # all matched charity above in ch_Need table
                        l = search_with_needs(desc_res, needs, theID)
                        if len(l) > 0:
                            response["information"] = l
                            resp = make_response(response)
                            resp.status_code = 200
                        # no matched needs
                        else:
                            response = {
                                "message": "Search failed: there is no result"
                            }
                            resp = make_response(response)
                            resp.status_code = 400
                        return resp
                    # X name, description, X needs
                    else:
                        l = search_no_needs(desc_res, theID)
                        response["information"] = l
                        resp = make_response(response)
                        resp.status_code = 200
                        return resp
                else:
                    response = {
                        "message": "Search failed: there is no result"
                    }
                    resp = make_response(response)
                    resp.status_code = 400
                    return resp

            # name, X description, needs?
            elif name != '':
                name_res = Charity.query.filter(Charity.name.contains(name)).all()
                # no result
                if not name_res:
                    response = {
                        "message": "Search failed: there is no result"
                    }
                    resp = make_response(response)
                    resp.status_code = 400
                    return resp
                # name, X description, needs
                if needs != '':
                    # all matched charity above in ch_Need table
                    l = search_with_needs(name_res, needs, theID)
                    if len(l) > 0:
                        response["information"] = l
                        resp = make_response(response)
                        resp.status_code = 200
                    # no matched needs
                    else:
                        response = {
                            "message": "Search failed: there is no result"
                        }
                        resp = make_response(response)
                        resp.status_code = 400
                    return resp
                # name, X description, X needs
                else:
                    l = search_no_needs(name_res, theID)
                    response["information"] = l
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp


# a function to create a list contains several json
# { "information": the list } --- the response for SEARCH function
# Noted: for "need" == ""
def search_no_needs(res, theid):
    l = []
    for item in res:
        charity_dict = {}
        charity_dict["name"] = item.name
        charity_dict["email"] = item.email
        charity_dict["description"] = item.description
        # deal with 'needs'
        theID = item.cid
        charity_needs = ch_Need.query.filter(ch_Need.charity_id == theID, ch_Need.is_valid == 1).all()
        need_id_list = []
        for i in charity_needs:
            need_id_list.append(i.need_id)
        need_res = Need.query.filter(Need.nid.in_(need_id_list)).all()
        need_list = []
        for item in need_res:
            need_list.append(item.name)
        charity_dict["needs"] = need_list

        # deal with 'is_connected'
        charity_res = sp_ch.query.filter(sp_ch.sp_id == theid, sp_ch.ch_id == theID).first()
        if charity_res:
            charity_dict["is_connected"] = charity_res.is_connected
        else:
            charity_dict["is_connected"] = 'not connected'

        l.append(charity_dict)
    return l


# Noted: for "need" != ""
def search_with_needs(res, needs, theid):
    id_list = []
    for item in res:
        id_list.append(item.cid)
    id_res = Need.query.filter(Need.name.contains(needs)).first()
    need_id = id_res.nid
    need_res = ch_Need.query.filter(ch_Need.charity_id.in_(id_list), ch_Need.need_id == need_id,
                                    ch_Need.is_valid == 1).all()
    l = []
    if len(need_res) > 0:
        new_id_list = []
        for item in need_res:
            new_id_list.append(item.charity_id)
        new_charity_res = Charity.query.filter(Charity.cid.in_(new_id_list)).all()
        l = search_no_needs(new_charity_res, theid)
    return l


@recommendation_ns.route('/')
class RecommendToCharity(Resource):
    @profile_ns.response(403, str({"message": "Only charity can see recommendations."}))
    @profile_ns.response(200, str({"message": "success",
                                   "data": [
                                       {
                                           "id": "3",
                                           "name": "GoodCharity",
                                           "email": "1@gmail.com",
                                           "needs": ["laptops", "clothes"],
                                           "is_connected": "1/3/not connected"
                                       }
                                   ]}))
    @api.param('from_email', 'the email of the account who wants to be recommended')
    @api.param('userRole', '1 (charity) / 2 (sponsor)')
    def post(self):
        content = request.get_json()
        email = content["from_email"]
        role = content["userRole"]

        response = {
            "message": "Only charity can see recommendations."
        }
        if role == '1':
            charity = Charity.query.filter(Charity.email == email).first()
            the_ID = charity.cid
            needs = ch_Need.query.filter(ch_Need.charity_id == the_ID, ch_Need.is_valid == 1).all()
            # get this charity's needs ID (list)
            charity_needs = []
            for item in needs:
                charity_needs.append(item.need_id)
            # get all matched sponsors according to needs
            all_sponsor = sp_Need.query.filter(sp_Need.need_id.in_(charity_needs)).all()
            l = []
            if all_sponsor:
                # create a list of all sponsors' id (duplicated)
                sponsor_list = []
                for sponsor in all_sponsor:
                    sponsor_list.append(sponsor.sponsor_id)
                # compute the count
                # {'id1': count1, 'id2': count2}
                sponsor_count = Counter(sponsor_list)
                # [('id2', count2), ('id1', count1)] (count2 >= count1)
                sponsor_sorted = sorted(sponsor_count.items(), key=lambda x: x[1], reverse=True)

                # get all relevant information
                for item in sponsor_sorted:
                    sponsor = Sponsor.query.filter(Sponsor.sid == item[0]).first()
                    if sponsor is None:
                        continue
                    # whether has connected
                    conn = sp_ch.query.filter(sp_ch.sp_id == sponsor.sid, sp_ch.ch_id == the_ID,
                                              sp_ch.is_connected == 2).first()
                    if not conn:
                        con_res = sp_ch.query.filter(sp_ch.sp_id == sponsor.sid, sp_ch.ch_id == the_ID).first()
                        sponsor_dict = {}
                        sponsor_dict["id"] = sponsor.sid
                        sponsor_dict["name"] = sponsor.name
                        sponsor_dict["email"] = sponsor.email
                        sponsor_needs_id = []
                        need = sp_Need.query.filter(sp_Need.sponsor_id == item[0], sp_Need.is_valid == 1).all()
                        for n in need:
                            sponsor_needs_id.append(n.need_id)
                        need_res = Need.query.filter(Need.nid.in_(sponsor_needs_id)).all()
                        sponsor_needs = []
                        for item in need_res:
                            sponsor_needs.append(item.name)
                        if sponsor_needs == ["Empty"]:
                            continue
                        sponsor_dict["needs"] = list(set(sponsor_needs))
                        if con_res:
                            status = con_res.is_connected
                            if status != 2:
                                sponsor_dict["is_connected"] = status
                        else:
                            status = 'not connected'
                            sponsor_dict["is_connected"] = status
                        l.append(sponsor_dict)
                    else:
                        pass

            response["message"] = "success"
            response["data"] = l
            resp = make_response(response)
            resp.status_code = 200
            return resp
        else:
            resp = make_response(response)
            resp.status_code = 403
            return resp


@communication_ns.route('/request')
class Request_Connection(Resource):
    @communication_ns.response(200, str({'role': '1 / 2', 'message': 'success'}))
    @api.param('role', '1(charity) / 2(sponsor); who will get the message')
    @api.param('message', 'the content of message')
    @api.param('email', 'the email of user who will get message')
    def put(self):
        req_email = request.headers.get('Authorization')
        result = request.get_json()
        role = result['role']
        message = result['message']
        resp_email = result['email']
        if role == '1':
            sponsor = Sponsor.query.filter(Sponsor.email == req_email).first()
            charity = Charity.query.filter(Charity.email == resp_email).first()
            if sponsor and charity:
                sp_ch_res = sp_ch.query.filter(sp_ch.ch_id == charity.cid, sp_ch.sp_id == sponsor.sid).first()
                if not sp_ch_res:
                    new_sp_ch = sp_ch(sp_id=sponsor.sid, ch_id=charity.cid, content=message, is_connected=1,
                                      direction=1)
                    db.session.add(new_sp_ch)
                    db.session.commit()
                    response = {
                        "role": "1",
                        "message": "success"
                    }
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
                elif sp_ch_res.is_connected == 2:
                    response = {
                        "message": "connection already exists"
                    }
                    resp = make_response(response)
                    resp.status_code = 202
                    return resp
                elif sp_ch_res.is_connected == 3:
                    sp_ch_res.is_connected = 1
                    sp_ch_res.content = message
                    sp_ch_res.direction = 1
                    db.session.commit()
                    response = {
                        "role": "1",
                        "message": "success"
                    }
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
                elif sp_ch_res.is_connected == 1:
                    response = {
                        "message": "connection is waiting for response "
                    }
                    resp = make_response(response)
                    resp.status_code = 203
                    return resp
        else:
            sponsor = Sponsor.query.filter(Sponsor.email == resp_email).first()
            charity = Charity.query.filter(Charity.email == req_email).first()
            if sponsor and charity:
                sp_ch_res = sp_ch.query.filter(sp_ch.ch_id == charity.cid, sp_ch.sp_id == sponsor.sid).first()
                if not sp_ch_res:
                    new_sp_ch = sp_ch(sp_id=sponsor.sid, ch_id=charity.cid, content=message, is_connected=1,
                                      direction=2)
                    db.session.add(new_sp_ch)
                    db.session.commit()
                    response = {
                        "role": "1",
                        "message": "success"
                    }
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
                elif sp_ch_res.is_connected == 2:
                    response = {
                        "message": "connection already exists"
                    }
                    resp = make_response(response)
                    resp.status_code = 202
                    return resp
                elif sp_ch_res.is_connected == 3:
                    sp_ch_res.is_connected = 1
                    sp_ch_res.content = message
                    sp_ch_res.direction = 2
                    db.session.commit()
                    response = {
                        "role": "1",
                        "message": "success"
                    }
                    resp = make_response(response)
                    resp.status_code = 200
                    return resp
                elif sp_ch_res.is_connected == 1:
                    response = {
                        "message": "connection is waiting for response "
                    }
                    resp = make_response(response)
                    resp.status_code = 203
                    return resp


@communication_ns.route('/response')
class response_connection(Resource):
    @communication_ns.response(200, str({'role': '1 / 2', 'message': 'success'}))
    @api.param('role', 'which user will response the message; 1(charity) / 2(sponsor)')
    @api.param('feedback', '2 accept 3 decline')
    @api.param('email', 'the email of user who will response message')
    def put(self):
        req_email = request.headers.get('Authorization')
        result = request.get_json()
        role = result['role']
        feedback = result['feedback']
        resp_email = result['email']
        if role == '1':
            sponsor = Sponsor.query.filter(Sponsor.email == req_email).first()
            charity = Charity.query.filter(Charity.email == resp_email).first()
            if sponsor and charity:
                sp_ch_res = sp_ch.query.filter(sp_ch.ch_id == charity.cid, sp_ch.sp_id == sponsor.sid).first()
                sp_ch_res.is_connected = feedback
                sp_ch_res.direction = '3'
                db.session.commit()
                response = {
                    "role": "1",
                    "message": "success"
                }
                resp = make_response(response)
                resp.status_code = 200
                return resp
            else:
                response = {
                    # "role": "1",
                    "message": "user do not exist"
                }
                resp = make_response(response)
                resp.status_code = 400
                return resp

        elif role == '2':
            sponsor = Sponsor.query.filter(Sponsor.email == resp_email).first()
            charity = Charity.query.filter(Charity.email == req_email).first()
            if sponsor and charity:
                sp_ch_res = sp_ch.query.filter(sp_ch.ch_id == charity.cid, sp_ch.sp_id == sponsor.sid).first()
                sp_ch_res.is_connected = feedback
                sp_ch_res.direction = '4'
                db.session.commit()
                # sp_ch.query.filter_by(sp_ch_res).update({'is_accepted': feedback})
                response = {
                    "role": "2",
                    "message": "success"
                }
                resp = make_response(response)
                resp.status_code = 200
                return resp
            else:
                response = {
                    # "role": "2",
                    "message": "user do not exist"
                }
                resp = make_response(response)
                resp.status_code = 400
                return resp


@communication_ns.route('/mail')
class check_mail(Resource):
    @communication_ns.response(200, str({'role': '1 / 2', 'message': 'success',
                                         "data": [
                                             {
                                                 "content": "init content",
                                                 "create_time": "Tue, 20 Jul 2021 15:00:53 GMT",
                                                 "direction": 2,
                                                 "email": "charity9@9900.com",
                                                 "id": 10,
                                                 "is_connect": 2,
                                                 "name": "charity9",
                                                 "update_time": "Wed, 20 Jan 2021 15:00:53 GMT"
                                             }
                                         ]}))
    @api.param('role', 'which user is checking the mail; 1(charity) / 2(sponsor)')
    @api.param('email', 'the email of user who wants to check mail')
    def get(self):
        email = request.headers.get('email')
        role = request.headers.get('role')

        if role == '1':
            charity = Charity.query.filter(Charity.email == email).first()
            the_ID = charity.cid
            sp_ch_resp = sp_ch.query.filter(sp_ch.ch_id == the_ID, sp_ch.direction != 2).order_by(
                sp_ch.update_time.desc()).all()
            l = []
            for sp_ch_record in sp_ch_resp:
                sp_ch_return = {}
                sponsor = Sponsor.query.filter(Sponsor.sid == sp_ch_record.sp_id).first()
                if sponsor is None:
                    continue
                sp_ch_return['id'] = sp_ch_record.sp_id
                sp_ch_return['name'] = sponsor.name
                sp_ch_return['email'] = sponsor.email
                sp_ch_return['content'] = sp_ch_record.content
                sp_ch_return['is_connect'] = sp_ch_record.is_connected
                sp_ch_return['direction'] = sp_ch_record.direction
                sp_ch_return['create_time'] = sp_ch_record.create_time
                sp_ch_return['update_time'] = sp_ch_record.update_time
                l.append(sp_ch_return)

            response = {"role": "1", "message": "success", "data": l}
            resp = make_response(response)
            resp.status_code = 200
            return resp

        elif role == '2':
            sponsor = Sponsor.query.filter(Sponsor.email == email).first()
            the_ID = sponsor.sid
            sp_ch_resp = sp_ch.query.filter(sp_ch.sp_id == the_ID, sp_ch.direction != 1). \
                order_by(sp_ch.update_time.desc()).all()
            print(sp_ch_resp)
            l = []
            for sp_ch_record in sp_ch_resp:
                sp_ch_return = {}
                charity = Charity.query.filter(Charity.cid == sp_ch_record.ch_id).first()
                if charity is None:
                    continue
                sp_ch_return['id'] = sp_ch_record.ch_id
                sp_ch_return['name'] = charity.name
                sp_ch_return['email'] = charity.email
                sp_ch_return['content'] = sp_ch_record.content
                sp_ch_return['is_connect'] = sp_ch_record.is_connected
                sp_ch_return['direction'] = sp_ch_record.direction
                sp_ch_return['create_time'] = sp_ch_record.create_time
                sp_ch_return['update_time'] = sp_ch_record.update_time
                l.append(sp_ch_return)

            response = {"role": "2", "message": "success", "data": l}
            resp = make_response(response)
            resp.status_code = 200
            return resp


if __name__ == '__main__':
    app.run(debug=True, port=5014)
