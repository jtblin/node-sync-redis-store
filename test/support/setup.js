var chai = require("chai");
global.should = chai.should();
global.expect = chai.expect;
global.sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
