//var $j = jQuery.noConflict();

var Api = {
	visitorIp : null,
	visitorCountry : null,
	visitorCountryId : null,
	visitorPrefix : null,
	visitor : null,
	countryBlocked : false,
	regAllowed : true,
	countryObject : null,
	apiUrl : SiteSettings.apiUrl,
	customer : null,

	init : function () {
		if (true == SO.model.Customer.isLoggedIn()) {
			Api.customer = SO.model.Customer.currentCustomer;
			Api.buildPersonalHeader();
		} else {
			$('#userLoginForm').removeClass('hidden1')
		}

		$('#userSection form.loginForm').submit(function () {
			Api.loginSubmit();
			return false;
		});
		$('#userSection form.logoutForm .logoutLink').click(function () {
			SO.model.Customer.logout({
				onFail : function () {
					location.reload();
				},
				onSuccess : function () {
					location.reload();

				}
			});

			return false;
		});
		if (!isNaN($('#so_container')))
			SpotOption.load("#so_container", 'en');
		Api.getGeoData();
		Api.firePixel(); 


	},
	
	storePixel : function (pixelData)  
	{   
		$.cookie('tracking-pixel', pixelData , {path:'/'});
	},  
	firePixel : function()  
	{   
		var myPixel = $.cookie('tracking-pixel');
		if (myPixel != null ){    
			$('body').append(myPixel);    
			 $.removeCookie('tracking-pixel', { path: '/' }); 
		}  
	}, 
   
   

	/***
	 *	Function 		: 	getGeoData
	 *	Functionality 	: 	Retrive the user GeoLocation settings
	 *	Parameters		: 	None
	 *	Requries		: 	None
	 *
	 ***/
	getGeoData : function () {
		$.getJSON('//' + SiteSettings.ajaxCallBack + '/RPCWP/visitorData', function (result) {
			Api.visitorIp = result.ip;
			Api.visitorCountry = result.country;
			Api.countryBlocked = result.countryBlocked;
			Api.regAllowed =result.regAllowed;
			$(document).trigger('gotUserLocalGeoData');

		});
	},
	/****
	*	Function 	: 	demoLogIn
	*
	*
	****/
	demoLogIn : function(){
			var url = '//' + SiteSettings.ajaxCallBack + '/home/demoregistration';
			$.getJSON (url , function(result){
								var demoMail = result;
								var demoPassword = '123456';
								SO.model.Customer.login({
									email : demoMail,
									password : demoPassword,
									onSuccess : function (data) {										
											location.reload();																											
									},
									onError : function (data) {
										alert(SiteSettings.terms.apiLoginOnError);
									},
									onFail : function (err) {
										alert(SiteSettings.terms.apiLoginOnFail + err);
									}
								});
							});
	},

	/***
	 *	Function 		: 	getReutersTicker
	 *	Functionality 	: 	Retrive the Reuters Ticker
	 *	Parameters		: 	None
	 *	Requries		: 	None
	 * 	Deprecated		: 	Moved the call to server side with caching, not needed
	 *
	 ***/
	getReutersTicker : function () {
		$.ajax({
			url : '//' + SiteSettings.ajaxCallBack + '/RPCWP/getJsonFile/LastOptions.json',
			type : "POST",
			dataType : 'json',
			success : function (result) {
				// console.log(result);
				var marquee = '<marquee id="reuters" behavior="scroll" scrollamount="3" direction="left" width="350" onmouseover="this.stop();" onmouseout="this.start();">';
				var Container = $('#HeaderNews #marqueeTopParent');
				$.each(result, function (key, asset) {
					if (asset.color == 1)
						marquee += '<span id="call">' + '  ' + asset.assetName + ' ' + asset.endRate + ' ' + asset.endDate + '</span>';
					else
						marquee += '<span id="put">' + asset.assetName + ' ' + asset.endRate + ' ' + asset.endDate + '</span>';
				});
				marquee += '</marquee>';
				$(Container).append(marquee);

			}
		});

	},

	/***
	 *	Function 		: 	buildPersonalHeader
	 *	Functionality 	: 	Updates the login area
	 *	Parameters		: 	user object
	 *	Requries		: 	User must me loggedin | getCustomerDetails()
	 *
	 ***/
	buildPersonalHeader : function () {
		var logedin = $('#loggedInBox');

		logedin.find('div.welcome').text(SO.model.Customer.currentCustomer.FirstName + ' ' + SO.model.Customer.currentCustomer.LastName);
		logedin.removeClass('hidden');

		$('#userLoginForm').remove();
		if (typeof general != 'undefined') {
                if (typeof general.customAfterLogin == "function"){
                                general.customAfterLogin();
                }
		}

	},

	/***
	 *	Function 		: 	getCustomerDetails
	 *	Functionality 	: 	Retrive the user object from the server
	 *	Parameters		: 	None
	 *	Requries		: 	User must me loggedin
	 *
	 ***/
	getCustomerDetails : function () {
		$.ajax({
			url : '//' + SiteSettings.ajaxCallBack + '/RPCWP/getCustomerDetails',
			type : "POST",
			dataType : 'json',
			attachSession : true,
			success : function (result) {

				if (result == 'notLoggedIn') {
					document.cookie = 'WPcustomerId=0; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/';
					$('#userLoginForm').removeClass('hidden1');
					return false;
				} else {
					document.cookie = "WPcustomerId=" + result.id + ";path=/";
					Api.buildPersonalHeader(result);
				}

			}
		});
	},

	/***
	 *	Function 		: 	loginSubmit
	 *	Functionality 	: 	Login the user to the system
	 *	Parameters		: 	url
	 *	Requries		: 	Login Form
	 *
	 ***/
	loginSubmit : function (url) {

		SO.model.Customer.login({
			email : $('#userLoginForm input[name="email"]').val(),
			password : $('#userLoginForm input[name="password"]').val(),
			onSuccess : function (data) {
				if (typeof(url) == "undefined")
					location.reload();
				else
					window.location = url;
				//Api.customer = SO.model.Customer.fetchCustomer();
				//Api.buildPersonalHeader();
				//console.log(Api.customer);
			},
			onError : function (data) {
				alert(SiteSettings.terms.apiLoginOnError);
			},
			onFail : function (err) {
				alert(SiteSettings.terms.apiLoginOnFail + err);
			}
		});

	},

	/***
	 *	Function 		: 	localizedAJAX
	 *	Functionality 	: 	Gets the loacl data from the server.
	 *	Parameters		: 	None
	 *	Requries		: 	Api.getGeoData()
	 *	Deprecated		:	Not in use.
	 *
	 ***/

	localizedAJAX : function () {
		$.ajax({
			url : '//' + SiteSettings.ajaxCallBack + '/RPCWP/getlocalData',
			type : "POST",
			dataType : 'json',
			success : function (result) {
				//console.log(result.currencies);
			}
		});
	},

	/***
	 *	Function 		: 	getCountries
	 *	Functionality 	: 	Gets the country list from the server and update the country dropDowns
	 *	Parameters		: 	None
	 *	Requries		: 	Api.getGeoData()
	 *
	 ***/
	getCountries : function () {
		$('select.countrylist  [iso='+ Api.visitorCountry+ ']').prop('selected', true);
		if($('input[name="Prefix"]') != null ) 
			$('input[name="Prefix"]').val($('option:selected', this).attr('prefix'));
	},

	setCookie : function (c_name, value, extime) {
		var date = new Date();
		date.setTime(date.getTime() + extime * 60);
		var c_value = escape(value) + ((extime == null) ? "" : "; expires=" + date.toUTCString());
		document.cookie = c_name + "=" + c_value + ";path=/";
	},

	addFunctionalCookie : function (data, cname) {
		var c_name = cname;
		var value = data;
		var extime = 5 * 60;
		Api.setCookie(c_name, value, extime);
	}

}

$(document).bind('spotoptionPlugin.ready', Api.init);