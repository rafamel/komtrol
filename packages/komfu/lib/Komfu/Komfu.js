'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rxjs = require('rxjs');

var _operators = require('rxjs/operators');

var _BaseKomfu2 = require('./BaseKomfu');

var _BaseKomfu3 = _interopRequireDefault(_BaseKomfu2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Komfu = function (_BaseKomfu) {
  _inherits(Komfu, _BaseKomfu);

  function Komfu() {
    var _ref;

    _classCallCheck(this, Komfu);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Komfu.__proto__ || Object.getPrototypeOf(Komfu)).call.apply(_ref, [this].concat(args)));

    _this.initialized = false;
    _this.provided = false;
    return _this;
  }

  _createClass(Komfu, [{
    key: 'provide',
    value: function provide(in$) {
      var _this2 = this;

      this.in$ = in$;
      var stream$ = this.stream(in$);

      var _next = void 0;
      var subject = new _rxjs.Subject();
      var obs = _rxjs.Observable.create(function (obs) {
        _next = obs.next.bind(obs);
        _this2.change(_this2.props, _this2.providers);
        _next = subject.next.bind(subject);
      });
      var setNext = function setNext(inProps, providers) {
        _this2.next = function next(props) {
          var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              merge = _ref2.merge;

          var promise = new Promise(function (resolve) {
            return resolveQueue.push(resolve);
          });
          _next([merge ? Object.assign({}, inProps, props) : props, providers]);
          return promise;
        };
      };

      var resolveQueue = [];
      this.out$ = stream$.pipe((0, _operators.switchMap)(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            props = _ref4[0],
            providers = _ref4[1];

        var piping = (0, _operators.tap)(function (props) {
          _this2.props = props;
          _this2.providers = providers;
          resolveQueue.shift()();
        });

        if (!_this2.initialized) {
          _this2.props = props;
          _this2.providers = providers;
          setNext(props, providers);
          _this2.init();
          _this2.initialized = true;
          return (0, _rxjs.merge)(obs, subject).pipe(piping);
        } else {
          setNext(props, providers);
        }

        _this2.change(props, providers);
        return subject.pipe(piping);
      }));

      return this;
    }
  }]);

  return Komfu;
}(_BaseKomfu3.default);

exports.default = Komfu;