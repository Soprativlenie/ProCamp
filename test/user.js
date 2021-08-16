process.env.NODE_ENV = 'default';

const { expect } = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
let config = require('config');
let should = chai.should();


chai.use(chaiHttp);

describe('GET /users', () => {
    it('It should get all users', (done) => {
      chai.request(config.AuthOptions.BaseUrl)
          .get('/users')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('data');
                res.body.should.have.property('meta');
            done();
          });
    });
});

describe('POST /users', () => {
    it('Create user with invalid email withoud @ symbol', (done) => {
        let user = {
            "name": "Igor Vdovichenko",
            "email": "igor.vdovichenkogmail.com",
            "gender": "male",
            "status": "inactive"
        }
      chai.request(config.AuthOptions.BaseUrl)
          .post('/users')
          .set("Authorization", `Bearer ${config.AuthOptions.AccessToken}`)
          .send(user)
          .end((err, res) => {
                res.should.have.status(422);
                res.body.data[0].should.have.property('field').to.eql('email');
                res.body.data[0].should.have.property('message').to.eql('is invalid');
            done();
          });
    });
});


describe('POST /users', () => {
    it('Create user with duplicated email', (done) => {
        let emailToDuplicate = ""

        chai.request(config.AuthOptions.BaseUrl)
        .get('/users')
        .end((err, res) => {
            emailToDuplicate = res.body.data[0].email;

            let userToDuplicate = {
                "name": "Igor Vdovichenko",
                "email": `${emailToDuplicate}`,
                "gender": "male",
                "status": "inactive"
            }

            chai.request(config.AuthOptions.BaseUrl)
            .post('/users')
            .set("Authorization", `Bearer ${config.AuthOptions.AccessToken}`)
            .send(userToDuplicate)
            .end((err, res) => {
                  res.should.have.status(422);
                  res.body.data[0].should.have.property('field').to.eql('email');
                  res.body.data[0].should.have.property('message').to.eql('has already been taken');
              done();
            });
        })
    });
});

describe('POST /users', () => {
    it('Create user with unacceptable value in gender field', (done) => {
        let user = {
            "name": "user1",
            "email": "test.123.test.321@aol.com",
            "gender": "unacceptable",
            "status": "inactive"
        }

        chai.request(config.AuthOptions.BaseUrl)
        .post("/users")
        .set("Authorization", `Bearer ${config.AuthOptions.AccessToken}`)
        .send(user)
        .end((err, res) => {
            res.should.have.status(422);
            res.body.data[0].should.have.property('field').to.eql('gender');
            res.body.data[0].should.have.property('message').to.eql("can't be blank");
        done();
      });
    });
});

describe('DELETE /users/id', () => {
    it('Delete non-existed user', (done) => {
        let userId = 123123123;
        chai.request(config.AuthOptions.BaseUrl)
        .delete("/users/" + userId)
        .set("Authorization", `Bearer ${config.AuthOptions.AccessToken}`)
        .end((err, res) => {
            res.should.have.status(404);
            res.body.data.should.have.property('message').to.eql("Resource not found");
            done();
        });
    });
});
