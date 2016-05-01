#!/usr/bin/env python

from flask import *
from flask.ext.cors import CORS
from flask.ext.login import LoginManager, login_user, logout_user, current_user, login_required

import simplejson as json
import sys

app = Flask(__name__, static_url_path='/static')
sess = Session()
app.config.from_object('config')

if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    print "Need database config"
    sys.exit(1)

from models import db, Quote, Vote, User

db.init_app(app)
#with app.app_context():
#    db.create_all()  # first-time init

login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = 'login'


@app.before_request
def before_request():
    g.user = current_user


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


# renders login page
@app.route('/login', methods=['GET'])
def render_login():
    return app.send_static_file('login.html')


@app.route('/', methods=['GET'])
def render_index():
    return app.send_static_file('index.html')


# user login
@app.route('/login', methods=['POST'])
def login():
    body = request.get_json()
    if body:
        email = body['email']
        password = body['password']
    else:
        email = request.form.get('email')
        password = request.form.get('password')
    registered_user = User.query.filter_by(email=email, password=password).first()
    if registered_user is None:
        return jsonify({"Error": "Email or Password invalid"})
    login_user(registered_user)
    return redirect("/admin", code=302)


# renders admin page
@app.route('/admin', methods=['GET'])
@login_required
def render_admin():
    return app.send_static_file('admin.html')

# protects admin page
@app.route('/static/admin.html')
@login_required
def protected_admin():
    return app.send_static_file('admin.html')


@app.route('/static/app/admin_table.js')
@login_required
def protected_admin_table():
    return app.send_static_file('app/admin_table.js')


# user logout
@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect("/login", code=302)


# renders summary page
@app.route('/summary', methods=['GET'])
def render_summary():
    return app.send_static_file('summary.html')


# get all quotes
@app.route("/quote", methods=['GET'])
def get_quote():
    results = {}
    if current_user.is_authenticated is True and request.args and request.args['all'] == "true":
        result = Quote.query.all()
        for item in result:
            results[item.id] = item.serialize
    else:
        # if user is not authenticated, return only quotes that are approved
        result = Quote.query.filter(Quote.active == True).all()
        for item in result:
            results[item.id] = item.serialize
    scores = db.session.query(Vote.quote_id, db.func.sum(Vote.value).label("score")).group_by(Vote.quote_id).join(
        Quote).filter(Quote.id.in_(results.keys())).all()

    for i in scores:
        results[i[0]]["score"] = i[1]

    return jsonify(results)


# gets details of single quote
@app.route("/quote/<int:id>", methods=['GET'])
def get_single_quote(id):
    quote = Quote.query.get(id)
    if quote is None:
        return jsonify({"Error": "Quote not found"}), 404
    if quote.active is False and current_user.is_authenticated is False:
        return jsonify({"Error": "Quote is hidden"}), 403
    quote.view_count += 1
    quote_score = db.session.query(db.func.sum(Vote.value)).group_by(Vote.quote_id).filter(Vote.quote_id == id).all()
    db.session.commit()
    quote = quote.serialize
    quote["score"] = quote_score[0][0]
    return jsonify(quote)


# submits a new quote
@app.route("/quote", methods=['POST'])
def post_new_quote():
    body = request.get_json()

    conditions = {}
    if "conditions" in body:
        conditions = body['conditions']

    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    ip = ip.partition(',')[0]

    quote = Quote(text=body['text'], conditions=json.dumps(conditions), view_count=1, ip=ip, active=False)
    db.session.add(quote)
    db.session.commit()

    vote = Vote(ip=ip, value=1, quote_id=quote.id)  # auto upvote every new quote by 1
    db.session.add(vote)
    db.session.commit()

    return jsonify(quote.serialize)


# submits a new vote for a single quote
@app.route("/quote/<int:quote_id>/vote", methods=['POST'])
def post_new_vote(quote_id):
    body = request.get_json()
    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    ip = ip.partition(',')[0]
    sign = body['value'];
    if (sign != 1 and sign != -1):
        return jsonify({"Error": "Bad vote value"}), 422
    quote = Quote.query.get(quote_id)
    if quote is None:
        return jsonify({"Error": "Quote not found"}), 404

    vote = Vote(ip=ip, value=sign, quote_id=quote_id)
    db.session.add(vote)
    db.session.commit()

    return jsonify(vote.serialize)


# approves/ activates a single quote
@app.route("/quote/<int:id>/approve", methods=['PUT'])
@login_required
def approve_quote(id):
    quote = Quote.query.get(id)
    if quote is None:
        return jsonify({"Error": "Quote not found"}), 404

    quote.active = True
    db.session.commit()
    return jsonify(quote.serialize)


# unapproves/ rejects a single quote
@app.route("/quote/<int:id>/reject", methods=['PUT'])
@login_required
def reject_quote(id):
    quote = Quote.query.get(id)
    if quote is None:
        return jsonify({"Error": "Quote not found"}), 404

    quote.active = False
    db.session.commit()
    return jsonify(quote.serialize)


# deletes a single quote
@app.route("/quote/<int:id>", methods=['DELETE'])
@login_required
def delete_quote(id):
    quote = Quote.query.filter_by(id=id).all()
    if not quote:
        return jsonify({"Error": "Quote does not exist"}), 404
    vote = Vote.query.filter_by(quote_id=id).all()

    for v in vote:
        db.session.delete(v)
    db.session.commit()
    for q in quote:
        db.session.delete(q)
    db.session.commit()
    return jsonify({"Success": "Quote has been deleted"})


cors = CORS(app)
if __name__ == "__main__":
    # app.debug = True  # uncomment to run debug mode
    app.run(host='0.0.0.0')
