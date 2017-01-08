;(function(window) {

	function getTime() {
		return new Date().getTime()
	}

	function getLen(x, y) {
		return Math.sqrt(x*x + y*y)
	}

	function getSwipeDirection(dx, dy) {
		var degree = Math.atan2(dy, dx) * (180/Math.PI)
		if(-45 < degree && degree <= 45) {
			return 'Right'
		}
		if(45 < degree && degree <= 135) {
			return 'Down'
		}
		if(-135 < degree && degree <= -45) {
			return 'Up'
		}
		return 'Left'
	}

	function getRotateDirection(vector1, vector2) {
		return vector1.x * vector2.y - vector2.x * vector1.y
	}

	function getRotateAngle(vector1, vector2) {
		var direction = getRotateDirection(vector1, vector2),
			len1 = getLen(vector1.x, vector1.y),
			len2 = getLen(vector2.x, vector2.y)

		if(len1 * len2 == 0) {
			return 0
		}

		var dot = vector1.x * vector2.x + vector1.y * vector2.y
		var radio = dot / (len1 * len2)

	    if(radio > 1) {
	    	radio = 1
	    }
	    if(radio < -1) {
	    	radio = -1
	    }

	    return Math.acos(radio) * direction * 180 / Math.PI
	}

	var Util = {
		extend: function(obj, src) {
		    for(var key in src) {
		        if(src.hasOwnProperty(key)) obj[key] = src[key]
		    }
		    return obj
		},
		getDom: function(id) {
			return document.getElementById(id.replace('#', ''))
		}
	}
	var Event = {
		on: function(events, listener) {
			var self = this, events = events.split(' ')
			if (!this.hasOwnProperty('listeners')) {
				this.listeners || (this.listeners = {})
			};
			events.forEach(function(event){
				self.listeners[event] || (self.listeners[event] = [])
				self.listeners[event].push(listener)
			})
			return this
		},
		emit: function(e) {
			var args = arguments.length > 1? Array.prototype.slice.call(arguments, 0): [e],
				type = args.shift(),
				that = this,
				events
			events = this.listeners ? this.listeners[type] : (void 0)
			if(!events) {
				return
			}
			events.forEach(function(event) {
				event.apply(that, args)
			}) 
		}
	}

	function Touch(selector) {
		this.startX = 0
		this.startY = 0
		this.startTime = 0
		this.longTapTimer = null 
		this.touchDistance = 0
		this.previousPinchScale = 1
		this.touchVector = null
		this.isSwiped = false

		this.element = Util.getDom(selector)

		this.moveX = 0
		this.moveY = 0

		this.bindEvent()
	}

	Touch.prototype = {
		bindEvent: function() {
			this.element.addEventListener('touchstart', this.touchstart.bind(this), false)
			this.element.addEventListener('touchmove', this.touchmove.bind(this), false)
			this.element.addEventListener('touchend', this.touchend.bind(this), false)
		},
		disableTouch: function() {
			this.element.removeEventListener('touchstart', this.touchstart)
			this.element.removeEventListener('touchmove', this.touchmove)
			this.element.removeEventListener('touchend', this.touchend)
		},
		enableTouch: function() {
			this.bindEvent()
		},
		touchstart: function(e) {
			this.emit('start', e)

			this.startX = e.touches[0].pageX
			this.startY = e.touches[0].pageY
			this.startTime = getTime()

			if(this.longTapTimer) {
				clearTimeout(this.longTapTimer)
			}

			if(e.touches.length > 1) {
				
				var point1 = e.touches[0],
					point2 = e.touches[1]
				var x = Math.abs(point1.pageX - point2.pageX),
					y = Math.abs(point1.pageY - point2.pageY)
				this.touchDistance = getLen(x, y)

				this.touchVector = {
					x: point2.pageX - point1.pageX,
					y: point2.pageY - point1.pageY
				}
			} else {

				// 双击
				if(this.previousTouchTime) {
					if(Math.abs(this.startX - this.previousTouchPoint.startX) < 10 &&
						Math.abs(this.startY - this.previousTouchPoint.startY) < 10) {

						if(this.startTime - this.previousTouchTime < 300) {
							this.emit('doubleTap', e)
						}
					}
				}

				// 开启定时器
				setTimeout(function() {
					this.emit('longTap', e)
				}.bind(this), 800)

				// 存储上次值
				this.previousTouchTime = this.startTime
				this.previousTouchPoint = {
					startX: this.startX,
					startY: this.startY
				}
			}
		},
		touchmove: function(e) {

			this.moveX = e.touches[0].pageX
  			this.moveY = e.touches[0].pageY

  			if(e.touches.length > 1) {
  				// 缩放
				var point1 = e.touches[0],
					point2 = e.touches[1]
				var x = Math.abs(point1.pageX - point2.pageX),
					y = Math.abs(point1.pageY - point2.pageY)
				var touchDistance = getLen(x, y)

				if(this.touchDistance) {
					e.scale = touchDistance / this.touchDistance
					this.emit('pinch', e)
				}
  				
  				if(this.touchVector) {
  					var vector = {
  						x: point2.pageX - point1.pageX,
						y: point2.pageY - point1.pageY
  					}

  					var angle = getRotateAngle(vector, this.touchVector)
  					e.angle = angle
  					this.emit('rotate', e)
  				}
  			} else {
  				// 滑动
  				if(this.moveX && Math.abs(this.moveX - this.startX) > 10 ||
			   		this.moveY && Math.abs(this.moveY - this.startY) > 10) {
  					this.isSwiped = true

  					var dx = this.moveX - this.startX
  					var dy = this.moveY - this.startY
  					var direction = getSwipeDirection(dx, dy)
  					var event = 'swipe'

  					e.dx = Math.abs(dx)
  					e.dy = Math.abs(dy)
  					
  					this.emit(event)
  					this.emit(event + direction, e)
  				}
  				
  			}

  			// 清除定时器
  			clearTimeout(this.longTapTimer)

		},
		touchend: function(e) {
			this.emit('end', e)
			if(this.isSwiped) {
				this.emit('swipeEnd', e)
				this.isSwiped = false
			}

			var timeStamp = getTime()

			// 清除定时器
  			clearTimeout(this.longTapTimer)

			// 间距阈值
			if(this.moveX && Math.abs(this.moveX - this.startX) > 10 ||
			   	this.moveY && Math.abs(this.moveY - this.startY) > 10) {


			} else {
				// 时间间隔
				if(timeStamp - this.startTime < 500) {
					this.emit('tap', e)
				}
			}

			// 重置	
			this.moveX = 0
			this.moveY = 0
		}
	}
	Util.extend(Touch.prototype, Event)
	// 暴露全局
	window.Touch = Touch

})(window);
