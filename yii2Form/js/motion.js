(function(){

/*===================filePath:[src/main/motion/motion.js]======================*/
/**
 * @author Brucewan
 * @version 1.0
 * @date 2014-06-13
 * @description tg核心功能
 * @example
		var tab1 = new mo.Tab({
			target: $('#slide01 li')
		}); 
 * @name mo
 * @namespace
 */
(function(){

	(function(){
		
		if(window.Motion) {
			return;
		}

		var Motion = /** @lends mo */{
			/**
			 * tg版本号
			 * @type {string}
			 */
			version: '1.1',

			/**
			 * 命令空间管理 eg. Motion.add('mo.Slide:mo.Tab', function(){})
			 * @param {string} name 
			 * @param {object} obj 
			 */

			add: function(name, obj){
				var target = window;
				var me = arguments.callee;
				var parent = null;
				var isMatch = /^([\w\.]+)(?:\:([\w\.]+))?\s*$/.test(name);
				var objNS = RegExp.$1.split('.');
				var parentNS = RegExp.$2.split('.');
				var name = objNS.pop();
				var isClass = /[A-Z]/.test(name.substr(0,1));
				var constructor = function(){
					var mainFn = arguments.callee.prototype.init;
					if (typeof(mainFn) == 'function' && arguments.callee.caller != me) {
						mainFn && mainFn.apply(this, arguments);
					}
				};

				for(var i = 0; i < objNS.length; i++) {
					var p = objNS[i];
					target = target[p] || (target[p] = {});
				}

				if (parentNS[0] != '') {
					parent = window;
					for (var i = 0; i < parentNS.length; i ++) {
						parent = parent[parentNS[i]];
						if(!parent) {
							parent = null;
							break;
						}
					}
				}


				if(isClass && typeof(obj) == 'function') {
					if(parent) {
						constructor.prototype = new parent();
						constructor.prototype.superClass = parent;
					} 
					target[name] = constructor;
					constructor.prototype.constructor = constructor;
					obj.call(target[name].prototype);
				} else {
					target[name] = obj;
				}

			}

		};

		window.Motion = window.mo = Motion;
	})();

})();

/*===================filePath:[src/main/base/base.js]======================*/
/**
 * @version 1.0
 * @date 2014-06-15
 * @description mo
 * @name mo
 * @namespace
*/

/**
 * @author Brucewan
 * @version 1.0
 * @date 2014-06-18
 * @description 基础类
 * @name mo.Base
 * @class
*/
(function(){
	
	
	Motion.add('mo.Base', function() {
		/**
		 * public 作用域
		 * @alias mo.Base#
		 * @ignore
		 */
		var _public = this;
		/**
		 * public static作用域
		 * @alias mo.Base.
		 * @ignore
		 */
		var _static = this.constructor;
		/**
		 * private static作用域
		 * @alias mo.Base~
		 * @ignore
		 */
		var _self = {};
		/**
		 * 构造函数
		 */
		_public.constructor = function() {
			// private作用域
			var _private = {};
		};


		/**
		 * 绑定事件
		 */
		
		_public.on = function(name, fn) {
			box = Zepto(this);
			return box.on.apply(box, arguments);
		};


		/**
		 * 绑定事件
		 */
		_public.off = function(name, fn) {
			box = Zepto(this);
			return box.off.apply(box, arguments);
		};

		/**
		 * 触发事件
		 */
		_public.trigger = function(name, data) {
			var box = Zepto(this);
			return box.triggerHandler.apply(box, arguments);
		};

		

	});

})();

/*===================filePath:[src/main/loader/loader.js]======================*/
/**
 * @author AidenXiong
 * @version 1.1
 * @date 2014-09-16
 * @description 图片懒加载
 * @extends mo.Base
 * @name mo.Loader
 * @requires lib/zepto.js
 * @param {Array} [res=[]] 需要加载的资源列表
 * @param {object} [opts] 配置参数
 * @param {Function} [opts.onLoading] 当个资源加载完成后的回调
 * @param {Function} [opts.onComplete] 所有资源加载完成后的回调
 * @param {Number} [opts.loadType=0] 0为并行加载  1为串行加载
 * @param {Number} [opts.minTime=0] 加载单个资源需要耗费的最少时间(毫秒)
 * @param {Strnig} [opts.dataAttr=preload] Dom元素需要预加载资源的dom属性默认：data-preload
 * @example
 		var sourceArr = []; //需要加载的资源列表
		new mo.Loader(sourceArr,{
			onLoading : function(count,total){
				console.log('onloading:single loaded:',arguments)
			},
			onComplete : function(time){
				console.log('oncomplete:all source loaded:',arguments)
			}
		})
 * @see loader/loader.html 资源预加载
 * @see loader/byselector.html 通过选择器的方式预加载
 * @see loader/mixed.html 混合加载方式
 * @update 
 * 	2015/01/28 增加支持并行和串行两种加载方式，且可设置加载单个资源所需的最少时间
 * 	2015/04/13 增加通过选择器方式定义加载图片/背景资源的方式
 * @class
*/
(function(){
	
	
	Motion.add('mo.Loader:mo.Base', function() {
		/**
		 * public 作用域
		 * @alias mo.Loader#
		 * @ignore
		 */
		var _public = this;

		var _private = {
			/**
			 * 空函数  什么也不干
			 * @return {[type]} [description]
			 */
			'empty' : function(){},
			/**
			 * 图片加载
			 * @param  {string}   src 需要加载的图片路径
			 * @param  {Function} fn  加载完图片的回调
			 * @return {undefined}       
			 */
			'imgLoader' : function(src, fn){
				var img = new Image(), sTime = new Date();
				img.onload = img.onerror = function(){ //加载错误也认为是加载完成
					fn(src, img, new Date()-sTime);
					img.onload = null;
				}
				img.src = src;
			},
			/**
			 * 脚本加载
			 * @param  {string}   src 需要加载的脚本路径
			 * @param  {Function} fn  加载完图片的回调
			 * @return {string} charset 脚本编码       
			 */
			'jsLoader' : function(){
				var firstScript = document.getElementsByTagName('script')[0];
				var scriptHead = firstScript.parentNode;
				var re = /ded|co/;
				var onload = 'onload';
				var onreadystatechange = 'onreadystatechange'; 
				var readyState = 'readyState';
				return function(src, fn, charset){
					charset = charset || 'gb2312';
					var script = document.createElement('script'), sTime = new Date();
					script.charset = charset;
					script[onload] = script[onreadystatechange] = function(){
						if(!this[readyState] || re.test(this[readyState])){
							script[onload] = script[onreadystatechange] = null;
							fn && fn(src, script, new Date() - sTime);
							script = null;
						}
					};
					script.async = true;
					script.src = src;
					scriptHead.insertBefore(script, firstScript);
				}
			}(),
			/**
			 * css样式文件加载
			 * @param  {string}   href 样式文件路径
			 * @param  {Function} fn   加载完成后的回调
			 * @return {undefined}     
			 */
			'cssLoader' : function(href,fn){
				var head = document.head || document.getElementsByTagName('head')[0];
				var sTime = new Date();
				node = document.createElement('link');
				node.rel = 'stylesheet';
				node.href = href;
				head.appendChild(node);
				fn && fn(href, node, new Date() - sTime);
			},
			/**
			 * [description]
			 * @param  {string}   src 音频文件路径
			 * @param  {Function} fn  加载完成的回调
			 * @return {undefined}    
			 */
			'audioLoader' : function(src, fn){
				var aud = new Audio(), sTime = new Date();
				$(aud).bind('canplaythrough', function() { // totally loaded
					fn(src, aud, new Date() - sTime);
				});
				aud.src = src;
				aud.load();
			},
			/**
			 * 根据url获取扩展名
			 * @param  {string} url url路径
			 * @return {string}     扩展名
			 */
			getExt : function(url){
				return url.match(/\.([^\.]*)$/)[0].substr(1).match(/^[a-zA-Z0-9]+/)[0];
			},
			/**
			 * 根据url获取资源类型
			 * @param  {string} url 文件路径
			 * @return {string}     文件类型
			 */
			getType : function(url){
				var ext = _private.getExt(url);
				var types = {
					'img' : ['png','jpg','gif'],
					'css' : ['css'],
					'js' : ['js'],
					'audio' : ['mp3','ogg','wav']
				}
				for(var k in types){
					if(types[k].indexOf(ext) > -1){
						return k
					}
				}
				return false;
			}
		};

		/**
		 * public static作用域
		 * @alias mo.Loader.
		 * @ignore
		 */
		var _static = this.constructor;



		_public.constructor = function(res, config) {
			if (!res) {
				return;
			}
			this.init(res, config);
		}

		// 插件默认配置
		_static.config = {
			'onLoading' : _private.empty,
			'onComplete' : _private.empty,
			'loadType' : 0, //0为并行加载  1为串行加载
			'minTime' : 0, //单个资源加载所需的最小时间数（毫秒）
			'dataAttr' : 'preload'
		};

		/***
		 * 初始化
		 * @description 参数处理
		 */
		_public.init = function(res, config) {
			var _self = this;
			if(typeof config == 'function'){
				var tempFunc = config;
				config = {
					'onComplete' : tempFunc
				}
			}
			_self.config = Zepto.extend(true, {}, _static.config, config); // 参数接收
			var config = _self.config;
			res = [].concat(res);

			var resourceCache = {}

			//获取页面上配置了预加载的节点
			var resDom = Array.prototype.slice.call(document.querySelectorAll('[data-'+config.dataAttr+']'));
			Zepto(resDom).each(function(index, el){
				var _el = Zepto(el);
				var attr = _el.attr('data-'+config.dataAttr);
				if(resourceCache[attr]){
					resourceCache[attr].push(el);
				}else{
					resourceCache[attr] = [el];
					res.indexOf(attr) < 0 && res.push(attr)
				}
			})

			config.event && _self.on(config.event);
			var len = res.length, loaded = 0;
			Zepto(res).each(function(index, item){
				if(typeof item == 'object'){
					len--;
					for(var k in item){
						len++;
					}
				}
			});
			var sTime = new Date().getTime();
			var replaceSrc = function(src){
				if(resourceCache[src]){ //是从节点上提取到的预加载数据
					Zepto.each(resourceCache[src], function(index, dom){
						dom.removeAttribute('data-'+config.dataAttr);
						var tagName = dom.tagName.toLowerCase();
						switch(tagName){
							case 'link': //css文件节点
								dom.href = src;
								break;
							case 'img':
							case 'script':
							case 'video':
								dom.src = src;
								break;
							default:
								dom.style.backgroundImage = 'url('+src+')';
						}
					})
				}
			}
			var load = function(src, node, durTime, realCompleteBack){
				var loadedFunc = function(){
					config.onLoading(++loaded, len, src, node);
					/**
					 * @event mo.Loader#loading
					 * @property {object} event 单个资源加载完成
					 */
					_self.trigger('loading',[loaded, len, src, node]);
					replaceSrc(src);
					realCompleteBack([loaded, len, src, node]);
					if(loaded == len){ //加载完成
						var times = new Date().getTime() - sTime;
						config.onComplete(times);
						/**
						 * @event mo.Loader#complete
						 * @property {object} event 所有资源加载完成
						 */
						_self.trigger('complete', [times]);
					}
				}
				var timeDiff = config.minTime - durTime;
				timeDiff > 0 ? setTimeout(loadedFunc, timeDiff) : loadedFunc();
			}
			if(res.length){
				var loadOne = function(item, resLoadBack, realCompleteBack){
					var resLoaded = function(item, resLoadBack, realCompleteBack){
						var type = _private.getType(item), realCompleteBack = realCompleteBack || function(){};
						var callFunc = _private[type+'Loader'];
						if(callFunc === undefined){ //不支持的类型默认认为是加载了
							resLoadBack(item, null, 0, realCompleteBack);
						}else{
							callFunc(item, function(){
								var args = Array.prototype.slice.call(arguments,0)
								args.push(realCompleteBack);
								resLoadBack.apply(null, args)
							});
						}
					}
					if(typeof item == 'object'){
						for(var k in item){//传入的为键值对  那么认为是选择器+背景图片资源   加载完成后直接应用
							(function(key, value){
								resLoaded(value, function(){
									var items = Zepto(key)
									if(items.is('img')){
										items.attr('src', value);
									}else{
										items.css('backgroundImage', 'url("'+value+'")');
									}
									var args = Array.prototype.slice.call(arguments,0)
									resLoadBack.apply(null, args);
								}, realCompleteBack);
							})(k, item[k])
						}
					}else{
						resLoaded(item, resLoadBack, realCompleteBack);
					}
				}
				if(config.loadType == 1){//串行加载
					var i = 0;
					(function(){
						var caller = arguments.callee;
						loadOne(res[i], function(){
							load.apply(null, arguments);
						}, function(){
							i++;
							res[i] && caller();
						})
					})()
				}else{ //并行加载
					Zepto.each(res, function(index, item){
						loadOne(item, load)
					});
				}
			}else{
				config.onComplete(0);
				_self.trigger('complete', [0]);
			}
		}
	});
})();
/*===================filePath:[src/main/tab/tab.js]======================*/
/**
 * @author Brucewan
 * @version 1.0
 * @date 2014-06-18
 * @description 切换类中
 * @extends mo.Base
 * @name mo.Tab
 * @requires lib/zepto.js
 * @requires src/base.js
 * @param {object|string} config.target 目标选项卡片，即供切换的 Elements list (Elements.length >= 2)
 * @param {object|string} [config.controller='ul>li*'] 触发器
 * @param {string} [config.direction='x'] 指定方向，仅效果为'slide'时有效
 * @param {boolean}  [config.autoPlay=false] 是否自动播放 
 * @param {number}  [config.playTo=0] 默认播放第几个（索引值计数，即0开始的计数方式） 
 * @param {number}  [config.switchTo=undefined] 切换到第几个（无动画效果） 
 * @param {string}  [config.type='touchend'] 事件触发类型
 * @param {string}  [config.currentClass='current'] 当前样式名称, 多tab嵌套时有指定需求
 * @param {boolean}  [config.link=false] tab controller中的链接是否可被点击
 * @param {number}  [config.stay=2000] 自动播放时停留时间
 * @param {object|string}  [config.prevBtn] 播放前一张，调用prev()
 * @param {object|string}  [config.nextBtn] 插放后一张，调用next()
 * @param {string}  [config.easing='swing'] 动画方式：默认可选(可加载Zepto.easying.js扩充)：'swing', 'linear'
 * @param {object{string:function}}  [config.event] 初始化绑定的事件
 * @param {object{'dataSrc':Element, 'dataProp':String, 'dataWrap':Element, 'delay': Number}}  [config.title] 初始化绑定的事件
 * @param {boolean}  [config.lazy=false] 是否启用按需加载
 * @example
		var tab1 = new mo.Tab({
			target: $('#slide01 li')
		});
 * @see tab/demo1.html 普通切换
 * @see tab/demo2.html 按需加载
 * @see tab/demo3.html 自定义事件
 * @class
*/
(function(){
	
	
	Motion.add('mo.Tab:mo.Base', function() {
		/**
		 * public 作用域
		 * @alias mo.Tab#
		 * @ignore
		 */
		var _public = this;

		var _private = {};

		/**
		 * public static作用域
		 * @alias mo.Tab.
		 * @ignore
		 */
		var _static = this.constructor;


		// 插件默认配置
		_static.config = {
			//target // 目标 tab items
			//controller // tab header(toc?)
			//width // 限定目标宽度
			//height // 限定目标高度
			effect: 'base',
			direction: 'x',
			autoPlay: false,
			playTo: 0, // 播放到第几个 tab
			switchTo: window.undefined, // 切换到第几个 tab
			type: 'touchend',
			currentClass: 'current',
			link: false,
			stay: 2000,
			delay: 200,
			touchDis: 20,
			loop: true,
			lazy: window.undefined,
			merge: false,
			degradation: 'base',
			animateTime: 300,
			event: {},
			easing: 'swing',
			title: {
				delay: 0
			},
			controlDisabed: false
		};

		_static.effect = {};

		/***
		 * 初始化
		 * @description 参数处理
		 */
		_public.init = function(config) {
			this.config = Zepto.extend(true, {}, _static.config, config); // 参数接收

			var self = this;
			var config = self.config;


			// 必选参数处理
			var target = Zepto(config.target);
			if (target.length <= 1) {
				return;
			}

			// 统计实例
			if(this.constructor.instances) {
				this.constructor.instances.push(this);
			} else {
				this.constructor.instances = [this];
			}

			// 参数处理
			Zepto.extend(self, /** @lends mo.Tab.prototype*/ {
				/**
				 * 目标选项卡片
				 * @type object
				 */
				target: target,

				/**
				 * 目标选项卡片控制器
				 * @type object
				 */
				controller: null,

				/**
				 * 上一个选项卡的索引值
				 * @type number|undefined
				 */
				prevPage: window.undefined,

				/**
				 * 当前播放第几个的索引值
				 * @type number|undefined
				 */
				curPage: window.undefined,

				/**
				 * 目标选项卡片容器
				 * @type object
				 */
				container: target.parent(), // 包裹容器

				//length: target.length, // 元素数目
				prevBtn: Zepto(config.prevBtn),
				nextBtn: Zepto(config.nextBtn),

				/**
				 * 播放状态
				 * @type boolean
				 */
				isPlaying: config.autoPlay
			});

			// 快捷传入自定义事件
			for(var name in config) {
				var result = /^on(.+)/.exec(name);
				if(result && result[1]) {
					config.event[result[1]] = config[name];
				}
			}

			// 效果作为自定义事件绑定
			if(_static.effect[config.effect]['beforechange']) {
				_static.effect[config.effect]['mobeforechange'] = _static.effect[config.effect]['beforechange'];
				delete _static.effect[config.effect]['beforechange'];
			}
			self.on(_static.effect[config.effect]);

			// 自定义事件绑定
			self.on(config.event);


			/**
			 * @event mo.Tab#beforeinit
			 * @property {object} event 开始初始化前
			 */
			if (self.trigger('beforeinit') === false) {
				return;
			}

			// DOM初始化
			_private.initDOM.call(self);

			// DOM绑定事件
			_private.attach.call(self);

			// 延时0s，待init对DOM修改渲染完成后执行
			/**
			 * @event mo.Tab#init
			 * @property {object} event 初始化完成
			 */
			if (self.trigger('init') === false) {
				return;
			}


			// 播放到默认Tab
			if(config.switchTo !== window.undefined) {
				self.switchTo(config.switchTo);
			} else {
				self.playTo(config.playTo);
			}
			

			// 自动播放
			if (config.autoPlay) self.play();


		};

		// 绑定事件
		_private.initDOM = function() {
			var self = this;
			var config = self.config;

			// 保证 目标层、包裹层、容器层 三层方便控制
			// if (/(:?ul|ol|dl)/i.test(self.container[0].tagName)) {
			// 	self.wrap = self.container;
			// 	self.container = self.wrap.parent();
			// } else {
			// 	config.target.wrapAll('<div class="tab_wrap">'); // 可能带来风险，尽量用用规则保障，不执行到这一步
			// 	self.wrap = self.target.parent();
			// }
			self.wrap = self.container;
			self.container = self.wrap.parent();

			// 如果有控制controller
			if (config.controller !== false) {
				config.controller = Zepto(config.controller);
				if (config.controller.length < 1) {
					var ul = Zepto('<ul class="controller">');
					var str = '';
					for (var i = 0; i < self.target.length; i++) {
						str += '<li>' + (i + 1) + '</li>';
					}
					ul.html(str);
					self.container.append(ul);
					config.controller = ul.children();
				}
				self.controller = config.controller;
			}

			// 移除不需要且只含有document.write的script标签，以防后续操作出错
			var scripts = self.target.find('script');
			scripts.each(function(i, elem) {
				elem = Zepto(elem);
				// 如果script中只执行了document.write，则移出该script标签
				if (/^\s*document\.write\([^\)]+\)[\s;]*$/.test(elem.html())) {
					elem.remove();
				}
			});

			// 获取标题
			var titleSrc = config.title.dataSrc || self.target;
			var titleProp = config.title.dataProp || 'title';
			var titleWrap = Zepto(config.title.dataWrap);
			titleSrc = Zepto(titleSrc);

			// 如果标题容器存在 并且 有标题数据
			if (titleWrap.length > 0 && titleSrc.attr(titleProp)) {
				self.titleWrap = titleWrap;
				self.titleData = [];
				titleSrc.each(function(i, obj) {
					self.titleData.push(Zepto(obj).attr(titleProp));
				});
			}

			// 检测前缀
			self.cssPrefix = '';
			self.propPrefix = '';
			var vendors = {'webkit': 'webkit', 'Moz': 'moz', 'ms': 'ms'};
			var testElem = document.createElement('div');
			for(var key in vendors) {
				if (testElem.style[key + 'Transform'] !== undefined) {
					self.cssPrefix = '-' + vendors[key] + '-';
					self.propPrefix = key;
					break;
				}
			}



		};

		// 绑定事件
		_private.attach = function() {
			var self = this;
			var config = self.config;

			if (self.controller) {
				Zepto.each(self.controller, function(i, elem) {
					var elem = Zepto(elem);
					var delayTimer;
					elem.on(config.type, function() {
						self.playTo(i);
					});
					if (!config.link) {
						Zepto(elem).on('touchend', function(e) {
							e.preventDefault();
						});
					}

				})
			}

			if (self.nextBtn) {
				Zepto(self.nextBtn).on('touchend', function(e) {
					self.next();
					e.preventDefault();
				});
			}

			if (self.prevBtn) {
				Zepto(self.prevBtn).on('touchend', function(e) {
					self.prev();
					e.preventDefault();
				});
			}

			self.wrap.on('touchstart', function() {
				// 如果没在自动播放
				if (self.isPlaying) {
					_private.clearTimer.call(self);
				}
			});
			Zepto('body').on('touchend', function() {
				// 如果没在自动播放
				if (self.isPlaying) {
					_private.setTimer.call(self);
				}

			});

			if(config.touchMove) {
				_private.touchMove.call(self);
			}

		};

		/**
		 * 播放到第几个选项卡
		 * @param {number} page 第几页（索引值）
		 */
		_public.playTo = function(page) {
			var self = this;
			var config = self.config;
			var hasCur = self.curPage !== window.undefined;
			var prevPage;

			// 临界计算
			self._outBound =  function(i) {
				if (i >= self.target.length) i %= self.target.length;
				if (i < 0) {
					var m = i % self.target.length;
					i = m === 0 ? 0 : (m + self.target.length);
				}
				return i;
			}


			self.prevPage = self.curPage;

			prevPage = self.curPage;
			page = self.curPage = self._outBound(page);


			if (self.controller && page !== prevPage) {
				var curCtrl = self.controller[page],
					prevCtrl = self.controller[prevPage];
				if (curCtrl) {
					//curCtrl.setAttribute('a', page);
					Zepto(curCtrl).addClass(self.config.currentClass);
				}
				if (prevCtrl) Zepto(prevCtrl).removeClass(self.config.currentClass); //如果正常获取


			}

			if(page !== prevPage) {
				self.target.eq(page).addClass(self.config.currentClass);
				self.target.eq(prevPage).removeClass(self.config.currentClass);	
			}

			// 填充标题
			if (self.titleWrap) {
				window.setTimeout(function() {
					self.titleWrap.html(self.titleData[self.curPage] || '');
				}, config.title.delay);
			}

			// 按需加载
			var curTarget = Zepto(self.target[self.curPage]);
			if (config.lazy === window.undefined) {
				var curChildren = curTarget.children();
				if (curChildren.length === 1 && curChildren[0].tagName.toLowerCase() == 'textarea') {
					config.lazy = true;
				}
			}
			if (config.lazy === true) {
				if (curTarget.length > 0 && !curTarget.data('parsed')) _private.lazyload(curTarget);
			}

			//self.config.onchange.call(self, page);
			/**
			 * @event mo.Tab#beforechange
			 * @property {object} event 开始切换
			 */
			if (self.trigger('beforechange', [self.curPage]) === false) {
				return;
			}

			self.trigger('mobeforechange');
			//if(self.effect) self.effect.onchange.call(self);

			

		};
/*
		 * 是否允许滑动
	     */
	     _public.touchMove = function(bool) {
	     	this.config.touchMove = bool;
	     }

		/**
		 * 播放后一个
		 */
		_public.next = function() {
			this.playTo(this.curPage + 1);
		};

		/**
		 * 播放前一个
		 */
		_public.prev = function() {
			this.playTo(this.curPage - 1);
		};

		/**
		 * 开始自动播放
		 */
		_private.setTimer = function() {
			var self = this;
			var config = self.config;
			if (self.timer) {
				_private.clearTimer.call(self);
			}

			self.timer = window.setInterval(function() {
				var to = self.curPage + 1;
				self.playTo(to);

			}, config.stay);

		};

		/**
		 * 停止自动播放
		 */
		_private.clearTimer = function() {
			window.clearInterval(this.timer);
		};

		/**
		 * 开始自动播放
		 */
		_public.play = function() {
			var self = this;
			_private.setTimer.call(self);
			self.isPlaying = true;
			self.trigger('play');
		};

		/**
		 * 停止自动播放
		 */
		_public.stop = function() {
			var self = this;
			_private.clearTimer.call(self);
			self.isPlaying = false;
			self.trigger('stop');
		};

		/**
		 * 无动画效果切换
		 */
		_public.switchTo = function(page) {
			var userAnimateTime = this.config.animateTime;
			this.config.animateTime = 0;
			this.playTo(page);
			this.config.animateTime = userAnimateTime;
		};

		_static.extend = function(name, events) {
			var obj = {};
			if (Zepto.isPlainObject(name)) {
				obj = name;
			} else {
				obj[name] = events;
			}
			Zepto.extend(_static.effect, obj);
		};

		_private.lazyload = function(curTarget) {
			var textareas = curTarget.children('textarea');

			// curTarget子元素有且只有一个textarea元素时
			if (textareas.length === 1) {
				curTarget.html(textareas.eq(0).val())
				curTarget.data('parsed', true);
			}
		};

		_private.touchMove = function(){
			var self = this;
			var config = self.config;

			var touchMove, touchEnd, touchDirection;
			var startX, startY, disX, disY, dis;
			var moveX,moveY, moveDisX, moveDisY, moveDis;

			if (config.touchMove) {
				self.wrap.on('touchstart', function(e) {
					startX = moveX = e.touches[0].pageX;
					startY = moveY = e.touches[0].pageY;

					/**
					 * @event mo.Tab#touchstart
					 * @property {object} event 开始切换
					 */
					if (self.trigger('touchstart', [startX, startY]) === false) {
						return;
					}

					self.wrap.on('touchmove', touchMove);
					self.wrap.on('touchend', touchEnd);
					touchDirection = '';
				});
			}
			touchMove = function(e) {


				if (!config.touchMove) {
					e.preventDefault();
					return false;
				}

				var x = e.touches[0].pageX;
				var y =  e.touches[0].pageY;
				disX = x - startX;
				disY = y - startY;
				moveDisX = x - moveX;
				moveDisY = y - moveY;
				moveX = x;
				moveY = y;


				if (self.curPage === self.target.length-1) {
					if (moveDisY < 0) {
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				}
				else if (self.curPage === 1) {
					if (moveDisY > 0) {
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				}


				if (config.direction == 'x') {
					dis = disX;
					moveDis = moveDisX;
				} else {
					dis = disY;
					moveDis = moveDisY;
				}
				if (!touchDirection) {
					if (Math.abs(disX / disY) > 1) {
						touchDirection = 'x';
					} else {
						touchDirection = 'y';
					}
				}

				if (config.direction == touchDirection) {

					e.preventDefault();
					e.stopPropagation();
					/**
					 * @event mo.Tab#touchmove
					 * @property {object} event 开始切换
					 */
					self.trigger('touchmove', [dis, moveDis, e]);
				}
				// if ((dis > 0 && self.curPage >= 0) || (dis < 0 && self.curPage <= self.target.length - 1)) {

				// }



			}
			touchEnd = function() {
				if (touchDirection && config.direction != touchDirection) {
					return;
				}
				if (dis === undefined || isNaN(dis)) {
					dis = 0;
				}

				// self.wrap.style.webkitTransitionDuration = config.animTime + 'ms';
				self.wrap.off('touchmove', touchMove);
				self.wrap.off('touchend', touchEnd);

				var isOK = true;

				/**
				 * @event mo.Tab#touchend
				 * @property {object} event 开始切换
				 */
				if (self.trigger('touchend', [dis]) === false) {
					return;
				}

				if (!dis || (Math.abs(dis) < config.touchDis || !isOK)) {
					self.playTo(self.curPage);
					return;
				}



				if (dis > 0) {
					var to = self.curPage - 1 < 0 ? 0 : self.curPage - 1;
				} else {
					var to = self.curPage + 1 >= self.target.length ? self.target.length - 1 : self.curPage + 1;
				}

				self.playTo(to);

				dis = 0;

			};

		};

		_static.extend('base', {
			init: function() {
				var self = this;
				config = self.config;
				Zepto.each(self.target, function(i, elem) {
					if (self.target[config.playTo][0] != elem) Zepto(elem).hide();
				});

			},
			beforechange: function() {
				var self = this,
					prevElem = self.prevPage === window.undefined ? null : self.target[self.prevPage],
					curElem = self.target[self.curPage];
				if (prevElem) Zepto(prevElem).hide();
				Zepto(curElem).show();
				/**
				 * @event mo.Tab#change
				 * @property {object} event 切换完成
				 */
				self.trigger('change', [self.curPage]);

			}
		});


	});
})();

/*===================filePath:[src/main/page-slide/page-slide.js]======================*/
/**
 * @author Brucewan
 * @version 1.0
 * @date 2014-06-18
 * @description 切换类
 * @extends mo.Tab
 * @name mo.PageSlide
 * @requires lib/zepto.js
 * @requires src/base.js
 * @requires src/tab.js
 * @param {boolean}  [config.touchMove=true] 是否允许手指滑动
  * @param {object|string} config.target 目标选项卡片，即供切换的 Elements list (Elements.length >= 2)
 * @param {object|string} [config.controller='ul>li*'] 触发器
 * @param {string} [config.effect='slide'] 指定效果，可选值：'slide', 'roll', 'scale'
 * @param {string} [config.direction='x'] 指定方向，仅效果为'slide'时有效
 * @param {boolean}  [config.autoPlay=false] 是否自动播放 
 * @param {number}  [config.playTo=0] 默认播放第几个（索引值计数，即0开始的计数方式） 
 * @param {number}  [config.switchTo=undefined] 切换到第几个（无动画效果） 
 * @param {string}  [config.type='mouseover'] 事件触发类型
 * @param {string}  [config.currentClass='current'] 当前样式名称, 多tab嵌套时有指定需求
 * @param {boolean}  [config.link=false] tab controller中的链接是否可被点击
 * @param {number}  [config.stay=2000] 自动播放时停留时间
 * @param {number}  [config.delay=150] mouseover触发延迟时间
 * @param {object|string}  [config.prevBtn] 播放前一张，调用prev()
 * @param {object|string}  [config.nextBtn] 插放后一张，调用next()
 * @param {string}  [config.easing='swing'] 动画方式：默认可选(可加载Zepto.easying.js扩充)：'swing', 'linear'
 * @param {object{string:function}}  [config.event] 初始化绑定的事件
 * @param {object{'dataSrc':Element, 'dataProp':String, 'dataWrap':Element, 'delay': Number}}  [config.title] 初始化绑定的事件
 * @param {boolean}  [config.lazy=false] 是否启用按需加载
 * @example
		var tab1 = new mo.PageSlide({
			target: $('#slide01 li')
		});
 * @see page-slide/demo2.html 垂直单屏滑动
 * @see page-slide/demo3.html 垂直缩放滑动
 * @class
*/
(function(){
	
	Motion.add('mo.PageSlide:mo.Tab', function() {
		/**
		 * public 作用域
		 * @alias mo.PageSlide#
		 * @ignore
		 */
		var _public = this;

		var _private = {};

		/**
		 * public static作用域
		 * @alias mo.PageSlide.
		 * @ignore
		 */
		var _static = this.constructor;



		_public.init = function(config) {
			this.config = Zepto.extend(true, {}, _static.config, config); // 参数接收
			
			// 初始化父类
			this.superClass.call(this, this.config);
		};

		_static.config = {
			touchMove: true,
			direction: 'y',
			effect: 'slide',
			controller: false
		};

		mo.Tab.extend('slide', {
			init: function() {
				var self = this;
				var config = self.config;

				// 清除浮动
				self.container.css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				self.container.css('-webkit-backface-visibility', 'hidden');


				// 设置不同方向不同的操作属性
				if (config.direction == 'x') {

					// 初始化CSS
					self.target.css('float', 'left');

					var wrapWidth = 0;
					self.target.each(function(i, elem) {
						wrapWidth += Zepto(elem)[0].offsetWidth;
					});
					if (wrapWidth <= 0) {
						wrapWidth = document.documentElement.offsetWidth * self.target.length;
					}

					self.wrap.css('width', config.wrapWidth || wrapWidth + 'px');

					// 设置操作属性
					self.animProp = 'translateX'; 
					self.offsetProp = 'offsetLeft';
				} else {
					self.animProp = 'translateY'; 
					self.offsetProp = 'offsetTop';
				}
			},


			touchmove: function(e, startDis, moveDis){
				var self = this;
				if(self.moving == true) {
					return;
				}


				var o = {};
				var currentVal = /\(([\d-]*).*\)/.exec(self.wrap.css(self.propPrefix + 'Transform'));
				var currentPos = currentVal ? currentVal[1]*1 : 0;
				o[self.cssPrefix + 'transform'] = self.animProp + '(' + (currentPos + moveDis)  + 'px) translateZ(0)';


				self.wrap.css(o, 0);

				
			},

			touchend: function(e, dis){
				var self = this;

				// 如果有单屏页面内容过多
				var rect = self.target[self.curPage].getBoundingClientRect();
				var winHeight = window.innerHeight;
				if( (dis < 0 && rect.bottom > winHeight) || (dis > 0 && rect.top < 0)) {
					return false;
				}	
			},

			beforechange: function() {
				var self = this;
				var config = self.config;
				var from = self.prevPage === window.undefined ? 0 : self.prevPage;
				var to = self.curPage;
				var pos;
				var o = {};
				var animObj;

				o[self.animProp] = -self.target[to][self.offsetProp] + 'px';

				self.moving = true; 
				self.wrap.animate(o, config.animateTime, config.easing, function() {
					self.moving = false;
					self.trigger('change', [self.curPage]);
				});
			}


		});


		mo.Tab.extend('roll', {
			init: function() {
				var self = this;
				var config = self.config;
				var cssPrefix = self.cssPrefix;
				var offset = self.wrap.offset();
				var size  = config.direction == 'x' ? offset.width : offset.height;
				var rotateFn = config.direction == 'x'  ? 'rotateY' : 'rotateX';
				var theta = 360 / self.target.length;
				var radius  = Math.round(  size / 2 / Math.tan( Math.PI / self.target.length ) );

				self.theta = theta;
				self.radius = radius;
				self.rotateFn = rotateFn;

				self.container.css(cssPrefix + 'perspective', 200 +'px');
				self.container.css(cssPrefix + 'backface-visibility', 'hidden');

				var wrapCss = {'position': 'relative'};
				wrapCss[cssPrefix + 'transform-style'] =  'preserve-3d';
				wrapCss[cssPrefix + 'transform'] = 'translateZ(-'+ radius  +'px)';
				wrapCss[cssPrefix + 'transform-origin'] = '50% 50% -'+ radius +'px';
				self.wrap.css(wrapCss);


				for(var i = 0; i < self.target.length; i++) {
					var targetCss = {
						'position': 'absolute',
						'left': 0,
						'top': 0
					};
					targetCss[cssPrefix + 'transform'] = rotateFn +'(-'+ i*360/self.target.length +'deg) translateZ('+ radius  +'px)';
					self.target.eq(i).css(targetCss);
				}
			},

			touchmove: function(e, startDis, moveDis){
				var self = this;
				if(self.moving == true) {
					return;
				}

				var angle = self.curPage * self.theta - startDis/5;
				// console.log(angle, startDis);

				self.wrap.css(self.cssPrefix + 'transform', self.rotateFn + '('+ angle +'deg) translateZ(-'+ self.radius  +'px)');

				e.preventDefault();
			},

			beforechange: function() {
				var self = this;
				var config = self.config;
				var angle = self.curPage * self.theta;
				var o = {};
				o[self.cssPrefix + 'transform'] = self.rotateFn  + '('+ angle +'deg) translateZ(-'+ self.radius  +'px)';
				self.moving = true;
				self.wrap.animate(o, config.animateTime, config.easing, function() {
					self.moving = false;
					self.trigger('change', [self.curPage]);
				});
			}

		});





		mo.Tab.extend('scale', {
			init: function() {
				var self = this;
				var config = self.config;
				var cssPrefix = self.cssPrefix;
				var offset = self.wrap.offset();
				var size  = config.direction == 'x' ? offset.width : offset.height;
				var rotateFn = config.direction == 'x'  ? 'rotateY' : 'rotateX';
				var theta = 360 / self.target.length;
				var radius  = Math.round(  size / 2 / Math.tan( Math.PI / self.target.length ) );

				self.wrap.css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				// self.container.css(cssPrefix + 'backface-visibility', 'hidden');


				self.target.each(function(i, obj){
					obj = Zepto(obj);
					var o = {};
					// o[self.cssPrefix + 'transform'] = 'scaleX(0.5) scaleY(0.5)';
					// obj.css(o);
				});



				// 设置不同方向不同的操作属性
				if (config.direction == 'x') {

					// 设置操作属性
					self.animProp = 'translateX'; 
					self.offsetProp = 'offsetLeft';
				} else {
					self.animProp = 'translateY'; 
					self.offsetProp = 'offsetTop';
				}
			},


			touchmove: function(e, startDis, moveDis){
				var self = this;
				if(self.moving == true) {
					return;
				}

				var o = {};
				var currentObj = self.target.eq(self.curPage);
				var currentVal = /\(([\d-]*).*\)/.exec(self.wrap.css(self.propPrefix + 'Transform'));
				var currentPos = currentVal ? currentVal[1]*1 : 0;
				o[self.cssPrefix + 'transform'] = self.animProp + '(' + (currentPos + moveDis)  + 'px)';

				if(startDis >0 ) {
					currentObj.css(self.cssPrefix + 'transform-origin', '50% 0%');
				} else {
					currentObj.css(self.cssPrefix + 'transform-origin', '50% 100%');
				}

				self.wrap.css(o, 0);

				var scale = 1-Math.abs(startDis/Zepto(window).height());



				e.preventDefault();

				var prevObjProp = {};
				prevObjProp[self.cssPrefix + 'transform'] = 'scaleX('+ scale +') scaleY('+ scale +')';
				currentObj.css(prevObjProp);




			},

			touchend: function(e, dis){

			},

			beforechange: function() {
				var self = this;
				var config = self.config;
				var obj = self.target.eq(self.curPage);
				var prevObj = self.prevPage === window.undefined ? null : self.target.eq(self.prevPage);

				var wrapProp = {};
				wrapProp[self.cssPrefix + 'transform'] = 'translateY(-' + obj[0].offsetTop + 'px)';


				// obj.css(self.cssPrefix + 'transform', 'scaleX(0.2) scaleY(0.2)');


				if(prevObj) {
					var prevObjProp = {};
					prevObjProp[self.cssPrefix + 'transform'] = 'scaleX(0.2) scaleY(0.2)';
					prevObjProp[self.cssPrefix + 'backface-visibility'] = 'hidden';
					prevObj.animate(prevObjProp, config.animateTime, config.easing, function() {
						prevObj.css(self.cssPrefix + 'transform', 'scaleX(1) scaleY(1)');
					});
				}

				var objProp = {};
				objProp[self.cssPrefix + 'transform'] = 'scaleX(1) scaleY(1)';
				objProp[self.cssPrefix + 'backface-visibility'] = 'hidden';
				obj.animate(objProp, config.animateTime, config.easing, function() {
					// self.trigger('change', [self.curPage]);
				});


				self.moving = true;
				
				self.wrap.animate(wrapProp, config.animateTime, config.easing, function() {
					self.moving = false;

					self.trigger('change', [self.curPage]);
				});


			},

			change: function(){

				// console.log(0)
			}


		});



		mo.Tab.extend('xx', {
			init: function() {
				var self = this;
				var config = self.config;
				var wrapOffset = self.wrap.offset();

				// 初始化样式
				self.wrap.css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				self.target.css({
					'position': 'absolute'
				});

				// 设置不同方向不同的操作属性
				if (config.direction == 'x') {
					self.animProp = 'translateX'; 
					self.offset = wrapOffset.width;
				} else {
					self.animProp = 'translateY'; 
					self.offset = wrapOffset.height;
				}

				// 往上翻移动层级
				self._launch = function(obj){
					self.target.css('zIndex', '1');
					var o = {};
					o[self.cssPrefix + 'transform'] = self.animProp + '(' + obj.data('oriPos') + 'px)';
					o.zIndex = '3';
					obj.css(o);
					obj.data('hasReady', true);
					
				};
			},


			touchmove: function(e, startDis, moveDis){
				var self = this;
				var targetObj;
				var plus;
				if(self.moving == true) {
					return;
				}

				if(self._targetObj === window.undefined) {
					var targetPage;
					var oriPos;
					if(startDis < 0) {
						targetPage = self._outBound(self.curPage + 1);
						oriPos =  self.offset;
					} else {
						targetPage = self._outBound(self.curPage - 1);
						oriPos = -self.offset;
					}
					self._targetObj = self.target.eq(targetPage);
					self._targetObj.data('oriPos', oriPos);
					self._launch(self._targetObj);
					self.target.eq(self.curPage).css('zIndex', '2');
				}

				var o = {};
				o[self.cssPrefix + 'transform'] = self.animProp + '(' + (startDis + self._targetObj.data('oriPos')) + 'px)';
				self._targetObj.css(o);
			},

			touchend: function(e, dis){
				var self = this;
				var config = self.config;
				// 回到本页
				if(Math.abs(dis) < self.config.touchDis) {console.log(self._targetObj);
					var o = {};
					o[self.animProp] =   '0px';
					self._targetObj.animate(o, config.animateTime, config.easing, function(){
						self.moving = false;
						self._targetObj.data('hasReady', false);

						delete self._targetObj;
					});
				} 

			},

			beforechange: function() {
				var self = this;
				var config = self.config;
				var pos;
				var o = {};
				var animObj;


				if(self._targetObj === window.undefined) {
					var oriPos;
					if( (self.prevPage !== window.undefined) && (self.curPage < self.prevPage)) {
						oriPos = -self.offset;
					} else {
						oriPos =  self.offset;
					}
					self._targetObj = self.target.eq(self.curPage);
					self._targetObj.data('oriPos', oriPos);
					self._launch(self._targetObj);
					self.target.eq(self.prevPage).css('zIndex', '2');
				}



				o[self.animProp] =   '0px';
				// console.log(self.curPage);

				self._targetObj.animate(o, config.animateTime, config.easing, function() {
					self.moving = false;
					self._targetObj.data('hasReady', false);
					delete self._targetObj;
					self.trigger('change', [self.curPage]);
				});

	


			},

			change: function(){

			}


		});






	});

})();

})();