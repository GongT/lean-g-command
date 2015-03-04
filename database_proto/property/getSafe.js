/**
 * 如果user不存在，那么get(user)返回undefined，再get会失败
 * order.get("user").get("mobilePhoneNumber")
 * 用这个就不会
 * order.getSafe("user").get("mobilePhoneNumber")
 * 但最后一个必须是get而不是getSafe
 */

module.exports = function (name){
	var v = this.get(name);
	if(!v){
		return {
			getSafe: function (){
				return this;
			},
			get    : function (){
				return undefined;
			}
		};
	}
	return v;
};
