"use strict";

var AXGridItem = null;
var CHEditor = null;
var parentParam = null;

$(document.body).ready(function() {

	parentParam = ax5.util.param(ax5.info.urlUtil().param);
	
	// 품의작성 팝업화면 사이즈를 설정한다.
	parent.modal.css({width : 1000,	height : $(parent.window).height() - 60});

	if(parent.getPopModal) {
		var pop = parent.getPopModal(parentParam.modalId);
		if(pop) pop.align({left:"center", top:"middle"});
	}else{
		if(parent.modal.activeModal) parent.modal.align({left:"center", top:"middle"});
	}
	$('input.old_bidding').css('display', '');	
	$('input.open_bidding').css('display', 'none');	
	
	CHEditor = new cheditor(); // 에디터 개체를 생성합니다.
	CHEditor.config.editorHeight = '100px'; // 에디터 세로폭입니다.
	CHEditor.config.editorWidth = '100%'; // 에디터 가로폭입니다.
	CHEditor.config.useImageUrl = false;
	CHEditor.config.useMap = false;
	CHEditor.config.useMedia = false;
	CHEditor.config.useFlash = false;
	CHEditor.config.useFullScreen = false;
	CHEditor.config.useBackColor = false;
	CHEditor.config.useBold = false;
	CHEditor.config.useClearTag = false;
	CHEditor.config.useCopy = false;
	CHEditor.config.useCut = false;
	CHEditor.config.useFlash = false;
	CHEditor.config.useFontName = false;
	CHEditor.config.useFontSize = false;
	CHEditor.config.useForeColor = false;
	CHEditor.config.useFormatBlock = false;
	CHEditor.config.useFullScreen = false;
	CHEditor.config.useHR = false;
	CHEditor.config.useImage = false;
	CHEditor.config.useImageUrl = false;
	CHEditor.config.useIndent = false;
	CHEditor.config.useItalic = false;
	CHEditor.config.useJustifyCenter = false;
	CHEditor.config.useJustifyFull = false;
	CHEditor.config.useJustifyLeft = false;
	CHEditor.config.useJustifyRight = false;
	CHEditor.config.useLineHeight = false;
	CHEditor.config.useLink = false;
	CHEditor.config.useMap = false;
	CHEditor.config.useMedia = false;
	CHEditor.config.useModifyTable = false;
	CHEditor.config.useNewDocument = false;
	CHEditor.config.useOrderedList = false;
	CHEditor.config.useOutdent = false;
	CHEditor.config.usePageBreak = false;
	CHEditor.config.usePaste = false;
	CHEditor.config.usePasteFromWord = false;
	CHEditor.config.usePreview = false;
	CHEditor.config.usePrint = false;
	CHEditor.config.useRedo = false;
	CHEditor.config.useRemoveFormat = false;
	CHEditor.config.useSelectAll = false;
	CHEditor.config.useSmileyIcon = false;
	CHEditor.config.useSource = false;
	CHEditor.config.useStrikethrough = false;
	CHEditor.config.useSubscript = false;
	CHEditor.config.useSuperscript = false;
	CHEditor.config.useSymbol = false;
	CHEditor.config.useTable = false;
	CHEditor.config.useTextBlock = false;
	CHEditor.config.useUnLink = false;
	CHEditor.config.useUnOrderedList = false;
	CHEditor.config.useUnderline = false;
	CHEditor.config.useUndo = false;
	
	//CHEditor.cheditor.toolbarWrapper.hidden=true;
	
	CHEditor.inputForm = 'docu_detail_long'; // 위에 있는 textarea의 id입니다. 주의:
												// name 속성 이름이 아닙니다.
	CHEditor.run(); // 에디터를 실행합니다.

	load_data();
	
	init_info();				

});

$(window).load(function(){
	if (CHEditor.cheditor.toolbarWrapper){
		CHEditor.cheditor.toolbarWrapper.remove();
	}else{
		setTimeout(function(){
			if (CHEditor.cheditor.toolbarWrapper){
				CHEditor.cheditor.toolbarWrapper.remove();
			}			
		}, 500);	
	}
});

function load_data(){

	if (!parentParam.pum_id) {
		myDialog.alert({
			title : "알림!",
			msg : "품의서 종류가 지정되지 않아 작업을 계속할 수 없습니다.",
			width : 400
		}, function() {
			parent.modal.close();
		});
		return;
	} else {
		$("#pum_id").val(parentParam.pum_id);
	}

	if (parentParam.pum_id && 1 == Number(parentParam.pum_id)) {
		// 휴가일수 재계산이 필요한 항목에 변경시 재계산 함수를 호출하도록 이벤트를 지정한다.
		$('.vacation_calc_obj').change(function() {
			calc_vacation_date();
		});
	}

	// 품의서 아이디가 있을경우는 해당 문서를 로딩한다.
	if (Number(parentParam.docu_id) > 0) {
		if( 'OpenBid' == parentParam.source ){
			// 전자결재 상신대기 문서인 경우 해당 인터페이스 자료를 로딩한다.
			loadReadyDoc(parentParam.docu_id, parentParam.mode);
		}else{
			loadRequestDoc(parentParam.docu_id, parentParam.mode);
		}				
	} else {
		// 품의서 종류를 설정한다.
		if (parentParam.pum_id)
			$('#pum_id').val(parentParam.pum_id);

		// 이미지 첨부, 파일첨부시 사용할 번호를 채번한다
		getNextDocuID();

		if (parentParam.pum_id && 1 == Number(parentParam.pum_id)) {
			if(!loadUserInfo(parentParam.inst_code)) return ;

			// 품의서 종류가 휴가계일 경우에는 기타휴가 종류를 선택할 수 있도록 select박스를 초기화 한다.
			$("#etc_vacation_list").append($('<option>', {
				value : '',
				text : '기타휴가 선택'
			}));
			loadCombo('/CodeAction.do?action=LoadCode', $('#etc_vacation_list'), null);

			// 휴가기간 기본값을 설정한다.
			var start_date = ax5.util.date(new Date(), {
				'return' : 'yyyy-MM-dd',
				'add' : {
					d : 0
				}
			});
			var end_date = ax5.util.date(new Date(), {
				'return' : 'yyyy-MM-dd',
				'add' : {
					d : 0
				}
			});
			$('#va_start_date').val(start_date);
			$('#va_end_date').val(end_date);

			// 휴가계인 경우 로그인 사용자의 잔여일수를 조회하여 표시한다.
			LoadVacationRemainder();

			//$('#va_start_date').ax5picker(myPicker);
			$('#rqt_wdate').ax5picker(myPicker);
			
			$('#docu_detail_long').val('<p>위와 같이 휴가를 신청하고자 합니다.</p>');
			try{
				// CHEditor.run(); 실행후 form이 다 표시되기 전에는 오류가 발생하므로 예외처리 작성.
				CHEditor.putContents('<p>위와 같이 휴가를 신청하고자 합니다.</p>');
			}catch(e){console.log(e)}
		}else if(parentParam.pum_id && (0 == Number(parentParam.pum_id) || 3 == Number(parentParam.pum_id) || 4 == Number(parentParam.pum_id) )){ // 구매, 구매요청.
			var rqt_wdate = ax5.util.date(new Date(), {'return' : 'yyyy-MM-dd'});
			
			$("#rqt_wdate").val(rqt_wdate) ;
		}else if(parentParam.pum_id && 9 == Number(parentParam.pum_id)){ //출장명령서
			
			$.get("pum_busi_trip_default.html", function(content) { 
				//console.log(content);
				$("textarea#docu_detail_long").val(content);
				CHEditor.putContents(content);
			});
		}else if(parentParam.pum_id && 6 == Number(parentParam.pum_id) && parentParam.security_index ){ //보안해제요청
			var template = "";
			$.get("/security/security_template.html", function(content) { 
				//console.log(content);
				template = content;
			
				$.get('/SecurityAction.do?action=SecurityRequestList&index_id='+parentParam.security_index, function(response) { 
					//console.log(response);
					
					var rs = JSON.parse(response.data);
					
					$.each(rs[0], function(key, value){
						template = template.replace('#'+key+'#', String(value).replace(/\n/gi,'<br>'));
					});
					
					$('#docu_sort').val(parentParam.security_index);
					$('tr.bidding_estimate_area').css('display', 'none');
					$("textarea#docu_detail_long").val(template);
					CHEditor.putContents(template);
				});
			
			});

		}else if(parentParam.pum_id && 10 == Number(parentParam.pum_id)  ){ //ERP인터페이스.
			//ERP에서 전자결제시  결제종류 (예: 검수결과, 거래처결제 등) 
			//001 : 입고검수, 
			//002 : 거래처결제, 
			//003 : 영업통합관리 전자품의, 
			//004 : 보안해제요청, 
			//005 : 법인카드 자동전표 전자결재, 
			//009 : 업체평가 
			
			$('#erp_id').val(parentParam.erp_id);
			$('#parm').val( ax5.util.number( parentParam.erp_parm ));
			
			if(!loadUserInfo(parentParam.inst_code)) return ;

			if( '001' == parentParam.erp_id ){ 
				//ls_url=ls_service_nm +"?pum_id=10&erpurl=http://tally.doore.co.kr:8080/tallyPage.html?"
				//ls_url  += "puchkdVo.base_yymm=" + ls_yymm + "&inst_code=" + gs_sys_id.user_sabn + "&erp_id=001"

				var base_yymm = parentParam.erp_parm;
				
				jQuery.ajax({
			          crossDomain: true,
			          type: "GET",
			          url : '/tally/tallyPage.html?puchkdVo.base_yymm=' +  base_yymm,
			          success: function(result) {
				 	      	//console.log(result);
							$("textarea#docu_detail_long").val(result);
							CHEditor.putContents(result);
				      },
				      error: function(result) {
					     	console.log(result);
					     	var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
							$("textarea#docu_detail_long").val(empty_message);
							CHEditor.putContents(empty_message);
					  },
				});				
			}else if( '002' == parentParam.erp_id ){ 
				//http://10.64.19.94:8080/approval/document_creator.jsp?pum_id=10&erpurl=http://tally.doore.co.kr:8080/acpaym/acpaymPage.html?acpaymVo.param=11201906&inst_code=1201305169&erp_id=002

				var index = parentParam.erp_parm;
				
				jQuery.ajax({
			          crossDomain: true,
			          type: "GET",
			          url : '/tally/acpaym/acpaymPage.html?acpaymVo.param=' +  index,
			          success: function(result) {
				 	      	//console.log(result);
							$("textarea#docu_detail_long").val(result);
							CHEditor.putContents(result);
				      },
				      error: function(result) {
					     	console.log(result);
					     	var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
							$("textarea#docu_detail_long").val(empty_message);
							CHEditor.putContents(empty_message);
					  },
				});				
			}else if( '003' == parentParam.erp_id ){ 
				//http://10.64.19.94:8080/approval/document_creator.jsp?pum_id=10&erpurl=http://tally.doore.co.kr:8080/bsunit/bsunitPage.html?bsunitVo.parm=4605&inst_code=1201305169&erp_id=003&erp_parm=4605
					
				var index = parentParam.erp_parm;
				
				jQuery.ajax({
			          crossDomain: true,
			          type: "GET",
			          url : '/tally/bsunit/bsunitPage.html?bsunitVo.parm=' +  index,
			          success: function(result) {
				 	      	//console.log(result);
							$("textarea#docu_detail_long").val(result);
							CHEditor.putContents(result);
				      },
				      error: function(result) {
					     	console.log(result);
					     	var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
							$("textarea#docu_detail_long").val(empty_message);
							CHEditor.putContents(empty_message);
					  },
				});				
			}else if('005' == parentParam.erp_id || '006' == parentParam.erp_id ){ 
				//http://gw.doore.co.kr:8080/approval/document_creator.jsp?pum_id=10&erpurl=http://tally.doore.co.kr:8080/acslip/acslipPage.html?acslipVo.parm=11,29793&inst_code=1201305169&erp_id=005&erp_parm=29793;%EB%B2%95%EC%9D%B8%EC%B9%B4%EB%93%9C%20%EC%82%AC%EC%9A%A9%EB%82%B4%EC%97%AD%20%EC%83%81%EC%8B%A0-2021.01.22(1%EA%B1%B4)
					var work_plac = parentParam.inst_code.substring(0,1)+'1';
					var index = parentParam.erp_parm.split(';');
					$('#parm').val( ax5.util.number( index[0] ));
					$("#docu_title").val( unescape(  decodeURI(index[1]) ) );
					
					var result = card_slip( index[0] , decodeURI( parentParam.makecont ), decodeURI(parentParam.slip_code));					

					$("textarea#docu_detail_long").val(result);
					
					try{CHEditor.putContents(result)}catch(e){};

			
					/*
					jQuery.ajax({
				          crossDomain: true,
				          type: "GET",
				          //url : '/tally/acslip/acslipPage.html?acslipVo.parm=' + work_plac + ',' + index[0],
				          url : '/erp/erp.jsp?portal_seq=' + index[0],
				          success: function(result) {
					 	      	//console.log(result);
								$("textarea#docu_detail_long").val(result);
								CHEditor.putContents(result);
					      },
					      error: function(result) {
						     	console.log(result);
						     	var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
								$("textarea#docu_detail_long").val(empty_message);
								CHEditor.putContents(empty_message);
						  },
					});	*/			
			}else if('009' == parentParam.erp_id){
					
					jQuery.ajax({
				          crossDomain: true,
				          //type: "PUT",
				          type: "GET",
				          //url: parentParam.erpurl + '=' + parentParam.erp_parm,
				          url : '/srm/company/company_rating_approval.jsp?rating_seq=' + parentParam.erp_parm,
				          success: function(result) {
					 	      	//console.log(result);
								$("textarea#docu_detail_long").val(result);
								CHEditor.putContents(result);
					      },
					      error: function(result) {
						     	console.log(result);
						     	var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
								$("textarea#docu_detail_long").val(empty_message);
								CHEditor.putContents(empty_message);
						  },
					});				
					/*
					$.get(parentParam.erpurl + '=' + parentParam.erp_parm, function(content) { 
						$("textarea#docu_detail_long").val(content);
						CHEditor.putContents(content);
					});
					*/
			}else if('011' == parentParam.erp_id){
				//http://gw.doore.co.kr:8080/approval/document_creator.jsp?pum_id=10&inst_code=1201305169&erp_id=011&erp_parm=20210329
				//http://gw.doore.co.kr:8080/approval/document_creator.jsp?pum_id=10&inst_code=1201305169&erp_id=011&erp_parm=20210329
					
					var work_plac = parentParam.inst_code.substring(0,1)+'1';
					var erp_parm = parentParam.erp_parm;
					$('#parm').val( erp_parm );
					$("#docu_title").val( '자금일보' );
					
					var result = jagum_master( work_plac , erp_parm);					

					$("textarea#docu_detail_long").val(result);
					
					default_app_line();
					
					CHEditor.putContents(result);


					
		
			}else{
				var empty_message = 'ERP인터페이스 자료를 찾을 수 없습니다.';
				$("textarea#docu_detail_long").val(empty_message);
				CHEditor.putContents(empty_message);
			}

		}else if(parentParam.pum_id && 11 == Number(parentParam.pum_id)){
			// 전자계약.
			
			$('#docu_title_label').text('계약명');
			$('#docu_title').attr('placeholder','계약명을 입력하십시오.');

		   	$('[data-ax5picker="register"]').ax5picker(myPicker);
		    $('[data-ax5picker="basic"]').ax5picker(mySinglePicker);

			LoadTemplateContents4Contract(parentParam.tmp_id, parentParam.saup_numb);
		}else{
			$('#docu_title_label').text('문서제목');
			$('#docu_title').attr('placeholder','문서의 제목을 입력하십시오.');
		}
	}

	if ('3' == parentParam.pum_id || '4' == parentParam.pum_id) {
		// 구매, 구매요청 인 경우에는 품목정보를 설정한다.
		init_grid(parentParam.docu_id);
	}
}

function default_app_line(){
	//k751106  //1200702029	송주미	//1200704050	신승호	

			$.post('/DocumentCreateAction.do?action=LoadDefaultAppLine4ERP', 'pum_id=' + $('#pum_id').val() + '&user_list=k751106,1200702029,1200704050'  )
			.success(function(result) {
				console.log(result);
				var list = JSON.parse(result.data);
				
				var my_jkgb = null;
				var default_line = [];
				
				$(list).each(function(i, user){
						default_line.push(user);
				});
				
				ApplyApprovalLine( JSON.stringify( default_line ) );
			}).error(function(result, error) {
				myDialog.alert({
					title : "알림!",
					msg : result.responseJSON.message,
					width : 300
				}, function() {
					if (result.responseJSON.result == -99)
						$(location).attr('href', '/');
				});
			}).complete(function() {
			});				
}

/**
 * 사원번호를 이용하여 정보를 조회한다.
 * @param empl_code
 * @returns
 */
function loadUserInfo(empl_code){
	var ret = false;
	$.ajax({
        crossDomain: true,
        type: "GET",
        url : '/Login.do?action=LoadMyInfoByEmplCode&empl_code=' + empl_code,
        async : false,
        success: function(result) {
        	
        	//console.log(result);
        	$(JSON.parse(result.data)).each(function(i, record) {
				
        		if($('#team_name'))$('#team_name').val( record.dept_name );
        		if($('#user_name'))$('#user_name').val( record.user_name );
        	});
        	
        	ret = true;
				
	      },
	      error: function(result) {

	    	  var msg = "두레포털에 로그인 되어 있지 않습니다.";
	    	  
	    	  if (result.responseJSON && Number(result.responseJSON.result) == -98) msg = result.responseJSON.message;
					
	    	  myMask.open();
	    	  
	    	  myDialog.prompt({
				        title: "두레포털 로그인",
				        width: 350,
				        msg: msg,
				        btns: {ok: {label:'로그인', theme:'warning'}, cancel: {label:'취소'}},
				        input: {
				        	user_id: {label: "아이디", type:"text", placeholder: "아이디를 입력하십시오.", required: true},
				        	password: {label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하십시오.", required: true},
				        },
				        onStateChanged: function () {
				        	if('open'==this.state){
				        	}
				        }
					},
					function () {
				        //console.log("callback", this);
				        if(this.key == 'ok' || (event.key == 'Enter' || event.keyCode == 13)){
				        	//var score = $('div#score_block input[name=score]:checked').val();
				        	$.ajax({
				        		method: "POST",
				                url: "/Login.do?action=Login",
				                data : 'user_id='+ this.input.user_id + '&password='+ this.input.password,        
				                async : false,
				                error: function (response) {
				            		myMask.close();
				            		myDialog.alert({title: "알림!", msg: response.responseJSON.message, width:300},function(){
				            			if (response.responseJSON.result == -99) $(location).attr('href', '/');
				            		});
				                },
				                success: function (response) {
				                	//console.log("append comment result", response);
				                	loadUserInfo(empl_code);
				                	load_data();
				                }
				            })
				            .done(function() {
				            	myMask.close();
				        	});
				        }else{
				    		myDialog.alert({
				    			title : "알림!",
				    			msg : "먼저 포털에 로그인 후에 재시도 하십시오.",
				    			width : 300
				    		}, function() {
				    				$(location).attr('href', '/');
				    		});
				        }
				    });
	      
	      
	    	  ret = false;
	      },
	});	
	
	return ret;
	
}

function init_grid(arg_docu_id) {
	AXGridItem = new ax5.ui.grid();

    AXGridItem.setConfig({
	    target: $('[data-ax5grid="AXGridItem"]'),
	    frozenColumnIndex: 1,
	    frozenRowIndex: 0,
	    showLineNumber: true,
	    showRowSelector: false,
	    multipleSelect: false,
	    lineNumberColumnWidth: 40,
	    rowSelectorColumnWidth: 28,
	    sortable: true, 
	    multiSort: false,
	    remoteSort: true,
	    header: {
	        align: "center",
	        columnHeight: 25
	    },
	    body: {
	        align: "center",
	        columnHeight: 32,
	        onClick: function () {
	            //console.log(this.self);
	            this.self.select(this.dindex);
	        }		        
	    },
	    columns: [
			{key : "item_nm", label : "품목명", width : 100, align : "left", sort : "", colHeadTool : false, editor : {type:"text"}	    	},
			{key : "item_spec", label : "규격/사양", width : 90, align : "left", sort : "", colHeadTool : false, editor : {type:"text"}	    	},
	    	{key : "item_unit", label : "단위", width : 60, align : "left", sort : "", colHeadTool : false, editor : {type:"text"}	    	},
	    	{key : "partners", label : "협력회사", width : 100, align : "left", sort : "", colHeadTool : false, editor : {type:"text"} },
	    	{label : "견적가(숫자만 입력)", align : "right", sort : "", colHeadTool : false
	    		,columns: [
	    			{key : "price", label : "1차", width : 90, align : "right", sort : "", colHeadTool : false, editor : {type:"text"}, formatter : "money"	    	},
	    			{key : "nego_price", label : "최종Nego", width : 90, align : "right", sort : "", colHeadTool : false, editor : {type:"text"}, formatter : "money"	    	},
	    			{key : "discount_bi", label : "인하율(%)", width : 80, align : "right", sort : "", colHeadTool : false, editor : {type:"text"}, formatter : function () { return this.value + '%'}	    	},
	    		]
	    	},
	    	{key : "price_ord", label : "최종가격/순위", width : 100, align : "right", sort : "", colHeadTool : false, editor : {type:"text"} 	    	},
	    	{key : "damdang", label : "영업 담당자", width : 80, align : "center", sort : "", colHeadTool : false, editor : {type:"text"} 	    	},
	    	{key : "phone", label : "전화번호", width : 90, align : "left", sort : "", colHeadTool : false, editor : {type:"text"} 	    	},
	    	{key : "path", label : "견적경로", width : 90, align : "left", sort : "", colHeadTool : false, editor : {type:"text"} 	    	},
	    	{key : "bigo", label : "비고", width : 100, align : "left", sort : "", colHeadTool : false, editor : {type:"text"} 	    	},
	    ],
	});
    
	if(arg_docu_id > 0){
		// 문서아이디가 있을경우 (기존문서 수정인 경우...) 품목정보를 조회한다.
		loadDocItemList(arg_docu_id)
	}
}


function getNextDocuID() {
	$.post('/DocumentCreateAction.do?action=GetNextDocuID', '', function(response) {
		$('#next_docu_id').val(response.next_docu_id);
	}).success(function() {
	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		});
	}).complete(function() {
	});
}

/**
 * 휴가계 최초 작성시 발생, 사용, 잔여일수 정보를 조회한다.
 * 
 * @param docu_id
 * @returns
 */
function LoadVacationRemainder() {
	$.post('/ApprovalAction.do?action=LoadVacationRemainder', 'va_sabun=' + $('#va_sabun').val(), function(result) {
		var rs = JSON.parse(result.data)
		$('#annual_remainder').html(''); // 기존 잔여일수 정보를 초기화 한다.
		$(rs).each(function(i, record) {

			$('#fitness_remainder').text(record.fitness_remainder);
			$('#che_want_cnt').attr('max', Math.round(Number(record.fitness_remainder)));
			
			$('#alternative_remainder').text(record.alternative_remainder);
			$('#de_want_cnt').attr('max', Math.round(Number(record.alternative_remainder)));

			$('#annual_remainder').append($('<span>', {
				text : '발생 : ' + record.annual_create
			}));
			//$('#annual_remainder').append($('<span>', {	text : '사용 : ' + record.annual_use	}));
			$('#annual_remainder').append($('<span>', {
				text : '잔여 : ' + record.annual_remainder
			}));
			$('#yen_want_cnt').attr('max', Math.round(Number(record.annual_remainder)));
			
		});

		$('#etc_want_cnt').attr('max', 30);

		$("#annual_remainder span").css('border', '1px solid orange').css('padding', '3px 5px').css('display', 'block').css('line-height', '1em').css('margin', '2px').css('border-radius', '10px');

	}).success(function() {
	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		});
	}).complete(function() {
	});
}

function showImageInfo() {
	var data = CHEditor.getImages();
	if (data == null) {
		myDialog.alert({
			title : "알림!",
			msg : '올린 이미지가 없습니다.',
			width : 300
		});
		return;
	}

	for (var i = 0; i < data.length; i++) {
		var str = '사진 URL: ' + data[i].fileUrl + "\n";
		str += '저장 경로: ' + data[i].filePath + "\n";
		str += '원본 이름: ' + data[i].origName + "\n";
		str += '저장 이름: ' + data[i].fileName + "\n";
		str += '사진 크기: ' + data[i].width + ' X ' + data[i].height + "\n";
		str += '파일 크기: ' + data[i].fileSize;

		myDialog.alert({
			title : "알림!",
			msg : str,
			width : 300
		});
	}
}

function calc_vacation_date() {
	// 종료일이 설정되어 있지 않으면 시작일과 동일하게 설정한다.
	if (!$('#va_end_date').val()) {
		$('#va_end_date').val($('#va_start_date').val());
	}

	// 종료일이 시작일보다 작으면 종료일을 시작일과 동일하게 설정한다.
	if ($('#va_end_date').val() < $('#va_start_date').val()) {
		$('#va_end_date').val($('#va_start_date').val());
	}
	var today = ax5.util.date(new Date(), {'return': 'yyyy-MM-dd'});
	if ( $('#va_start_date').val() < today) {
		myToast.confirm({theme: 'danger', msg:'휴가일자가 오늘보다 이전 날짜가 선택되었습니다.'});
	}	

	var va_param = Number($('input[name="va_param"]:checked').val());
	if (9 == va_param) {
		// 반차를 사용하지 않을 경우 휴가일수를 직접 입력하도록 한다.
		$('input[type=number].va_days').each(function(i, obj) {
			$(obj).attr('readonly', false);
		});
	} else {
		// 반차를 선택한 경우.
		$('input[type=number].va_days').each(function(i, obj) {
			// 휴가일수를 모두 초기화 한다.
			$(obj).val(0);
			// 직접입력하지 못하도록 한다. - 반차와 일반휴가는 분리하여 상신하므로...
			$(obj).attr('readonly', true);
		});
		if (va_param < 2) {
			// 체력단련 오전,오후 반차인 경우 체력단련 휴가일수에 1을 입력한다.
			$("#che_want_cnt").val(1);
		} else {
			// 연차휴가 일수에 1을 입력한다.
			$("#yen_want_cnt").val(1);
		}
	}

	// TODO : 무결성 검증 - 날짜가 없는데 반차를 선택하거나...
	// 기타휴가 일수를 입력했으나 휴가종류가 선택이 안되었거나...	
	$('input[type=number].va_days').each(function(i, obj){
		if($(obj).attr('max')){
			if (Number($(obj).val()) > Number($(obj).attr('max'))) {
				
				var msg = "";
				if ( Number($(obj).attr('max')) > 0) {
					msg = "최대 " + $(obj).attr('max') + "일 이상은 경영지원팀으로 문의 하시기 바랍니다."
				}else{
					msg = "잔여일수를 확인하여 주십시오.\n\n자세한 사항은 경영지원팀으로 문의 하시기 바랍니다."
				}
				
				myDialog.alert({title : "알림!",	msg : msg,width : 300}, function() {
					$(obj).val(0);
					$('input#va_sort_9').trigger('click');
				});
				
				return false;
			}
		}
	});

	$('#etc_vacation_list').attr('size', 1).css('position', '');
	if ($('#etc_vacation_list').val()) {
		
		//산전/산후 휴가 일수 기본값을 설정한다.
		if('08' == $('#etc_vacation_list').val() ){
			$('#etc_want_cnt').val(90);
		}
		
		if (Number($('#etc_want_cnt').val()) <= 0) {
			// myToast.push("기타휴가를 선택하신 경우에는 기타휴가 일수를 입력하십시오.");
			myDialog.alert({
				title : "알림!",
				msg : "기타휴가를 선택하신 경우에는 기타휴가 일수를 입력하십시오.",
				width : 300
			}, function() {
				//$('#etc_vacation_list').val('');
				$('#etc_want_cnt').focus();
			});
			return false;
		}
	} else {
		// 기타휴가 종류를 선택하지 않으면 휴가일수를 초기화 한다.
		if (Number($('#etc_want_cnt').val()) > 0) {
			// myToast.push("기타휴가 종류를 선택하십시오.");
			myDialog.alert({
				title : "알림!",
				msg : "기타휴가 종류를 선택하거나 \n기타휴가 일수를 삭제하십시오.",
				width : 300
			}, function() {
				$('#etc_vacation_list').css('position', 'absolute').css('z-index', '100').css('max-width', '200px').css('padding', '4px').attr('size', 8);
				$('#etc_vacation_list option').css('padding', '4px').css('border', '1px dashed green').css('margin', '2px').css('border-radius', '10px');
			});
			return false;
		}
	}

	var vacation_day = 0;
	var vacation_type_cnt = 0;
	$('input[type="number"].vacation_calc_obj').each(function(i, obj) {
		vacation_day += Number($(obj).val());
		if(Number($(obj).val()) > 0 ) {
			vacation_type_cnt++;
		}
	});

	if('08' == $('#etc_vacation_list').val() && vacation_type_cnt > 1){
			myDialog.alert({
				title : "알림!",
				msg : "기타휴가(사전산후)를 포함하는 경우\n휴가종류별로 분할하여 신청하십시오.",
				width : 300
			}, function() {
				// 기존 입력된 휴가일수를 삭제한다.
				$('#etc_vacation_list').val('');
				$('input[type="number"].vacation_calc_obj').each(function(i, obj) {
					$(obj).val(0);
				});
			});
			return false;
	}

	// TODO : 휴가기간의 종료일자는 erp서버에서 calendar정보를 기반으로 조회해야함.
	// var end_date = ax5.util.date($('#va_start_date').val(), {'return':
	// 'yyyy-MM-dd', 'add': {d: --vacation_day}});
	if('08' == $('#etc_vacation_list').val() ){
		// 산전/산후 휴가는 공휴일 정보 무시하고 시작일 이후 90일을 종료 날짜로 계산한다.
		let va_end_date = ax5.util.date($('#va_start_date').val(), {'return': 'yyyy-MM-dd', 'add': {d: 89}});
		$('#va_end_date').val(va_end_date);
	}else{
		$.post('/CodeAction.do?action=GetEndHollyDate', 'start_date=' + $('#va_start_date').val() + '&days=' + vacation_day, function(response) {
			$('#va_end_date').val(response[0].end_date);
		}).success(function() {
		}).error(function(result, error) {
			myDialog.alert({
				title : "알림!",
				msg : result.responseJSON.message,
				width : 300
			});
		}).complete(function() {
		});
	}
}

function loadRequestDoc(arg_docu_id, mode) {
	myToast.push("결재할 문서를 불러오는 중입니다.");

	$.post('/ApprovalAction.do?action=LoadRequestDoc', 'docu_id=' + arg_docu_id
	).success(function(response) {

		if (response.result < 0) {
			myDialog.alert({
				title : "알림!",
				msg : response.message,
				width : 300
			});
		} else {
			var rsRequestDoc = JSON.parse(response.data);
			var html = [];
			if (rsRequestDoc.length < 1) {
				myDialog.alert({
					title : "알림!",
					msg : "문서 상세정보를 조회할 수 없습니다.",
					width : 300
				});
			} else {
				$(rsRequestDoc).each(function(i, record) {
					// 결재상태 : record.docu_base_state
					// 관련문서 : record.ref_docu_id
					// ERP인터페이스 정보 : erp_id
					// 견적서, 전자계약 정보 : est_code

					$('#document_pumname').text(record.pum_name);
					if('copy'!=mode){
						// 문서를 복사할때는 로그인한 사용자의 팀명과 사용자 성명을 사용하도록 한다.
						$('#team_name').val(record.team_name);
						$('#user_name').val(record.user_nm);
					}

					$('#docu_title').val(record.docu_title);
					$('#docu_id').val(record.docu_id);
					$('#docu_num').val(record.docu_num);
					if('copy'==mode){
						// 문서를 복사할 때는 상태를 상신중으로 변경한다.
						$('#docu_base_state').val('0');
					} else {
						$('#docu_base_state').val(record.docu_base_state);
					}

					// 공람자 정보
					$('#open_men_id').val(record.open_men_id);
					$('#open_men_nm').val(record.open_men_nm);

					if (record.open_men_id && record.open_men_nm) {
						add_share_user_init(record.open_men_id, record.open_men_nm);
					}

					$('#keyword').val(record.keyword);

					$('#rqt_wdate').val(record.rqt_wdate);
					$('#rqt_busil').val(record.rqt_busil);
					$('#rqt_nm').val(record.rqt_nm);
					$('#est_code').val(record.est_code);
					$('#bid_code').val(record.bid_code);
					$('#parm').val( record.parm );
		
					if(record.est_code && (record.est_code.indexOf('B') >= 0 || record.est_code.indexOf('E') >= 0)) {
						$('input.old_bidding').css('display', '');	
						$('input.open_bidding').css('display', 'none');	
						
						$('#est_name').css('cursor', 'pointer');	
						$('#est_name').attr('placeholder', '클릭하시면 상세정보를 조회할 수 있습니다.');	
						$('#est_name').on('click', function(){	
			        		detail_view(record.est_code);						
						});
					}

					if(record.bid_code && (record.bid_code.indexOf('B') >= 0 || record.bid_code.indexOf('E') >= 0)) {
						$('input.old_bidding').css('display', 'none');	
						$('input.open_bidding').css('display', '');	
						
						$('#bid_name').css('cursor', 'pointer');	
						$('#bid_name').attr('placeholder', '클릭하시면 상세정보를 조회할 수 있습니다.');	
						$('#bid_name').on('click', function(){	
			        		openbid_detail_view(record.bid_code);						
						});
					}

					if (record.pum_id == 1) { /* 휴가계 */

						$('#va_sabun').val(record.va_sabun);
						$('#va_sabun_nm').val(record.va_sabun_nm);

						$('#va_busabun').val(record.va_busabun);
						$('#va_buname').val(record.va_buname);

						$('#va_start_date').val(record.va_start_date);
						$('#va_end_date').val(record.va_end_date);

						$('#che_want_cnt').val(record.che_want_cnt);
						if (0 == record.parm)
							$('#va_sort_1_am').prop('checked', true);
						if (1 == record.parm)
							$('#va_sort_1_pm').prop('checked', true);

						$('#de_want_cnt').val(record.de_want_cnt);
						$('#yen_want_cnt').val(record.yen_want_cnt);
						if (2 == record.parm)
							$('#va_sort_3_am').prop('checked', true);
						if (3 == record.parm)
							$('#va_sort_3_pm').prop('checked', true);

						$('#etc_want_cnt').val(record.etc_want_cnt);
						// 기타휴가종류
						$("#etc_vacation_list").append($('<option>', {
							value : '',
							text : '기타휴가 선택'
						}));
						loadCombo('/CodeAction.do?action=LoadCode', $('#etc_vacation_list'), record.va_sort_4);

						// 휴가계인 경우 로그인 사용자의 잔여일수를 조회하여 표시한다.
						LoadVacationRemainder();
						var data = record.docu_detail;
						data = data.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gi,'');
						$('#docu_detail_long').val(data);
						CHEditor.putContents(data);
					}else if (record.pum_id == 10) { 
						if(record.docu_id) loadDocContents(record.docu_id);

						// ERP 인터페이스 문서는 본문내용 수정을 못하도록 한다. 
						CHEditor.cheditor.modetab.rich.hidden=true;
						CHEditor.cheditor.modetab.code.hidden = true;
						CHEditor.cheditor.modetab.preview.click();
					} else {
						if(record.docu_id) loadDocContents(record.docu_id);
					}
					
					if(record.pum_id && 11 == Number(record.pum_id)){
						// 전자계약.
					
						$('#contract_code').val(record.contract_code);
						$('#docu_title_label').text('계약/입찰명');
						$('#docu_title').attr('placeholder','계약명 또는 입찰명 을 입력하십시오.');
						LoadContract(record.est_code, record.docu_id);
					}

					
				});

				if (mode && 'copy' == mode) {
					//문서복사 할때는 기존문서 번호는 제거하고 신규번호를 채번한다.
					$('#mode').val('copy');
					$('#docu_id').val('');
					getNextDocuID();
				}
				// $('#approval_request_list').trigger("create");
			}

		}

	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		}, function() {
			if (result.responseJSON.result == -99)
				$(location).attr('href', '/');
		});
	}).complete(function() {
		if (arg_docu_id) loadDocAppLine(arg_docu_id, mode);
		loadDocAttachFiles(arg_docu_id);
		loadDocLink(arg_docu_id, 'LoadDocLink', 'relation_documents_list') ;
		loadShareUser(arg_docu_id) ;

	});

}



function loadReadyDoc(arg_docu_id, mode) {
	myToast.push("결재할 문서를 불러오는 중입니다.");

	$.post('/OpenBidInterfaceAction.do?action=LoadReadyDoc', 'docu_id=' + arg_docu_id
	).success(function(response) {

		if (response.result < 0) {
			myDialog.alert({
				title : "알림!",
				msg : response.message,
				width : 300
			});
		} else {
			var rsRequestDoc = JSON.parse(response.data);
			var html = [];
			if (rsRequestDoc.length < 1) {
				myDialog.alert({
					title : "알림!",
					msg : "문서 상세정보를 조회할 수 없습니다.",
					width : 300
				});
			} else {
				$(rsRequestDoc).each(function(i, record) {
					// 결재상태 : record.docu_base_state
					// 관련문서 : record.ref_docu_id
					// ERP인터페이스 정보 : erp_id
					// 견적서, 전자계약 정보 : est_code

					$('#document_pumname').text(record.pum_name);
	
					$('#docu_title').val(record.docu_title);
					$('#docu_id').val(record.docu_id);
					$('#docu_num').val(record.docu_num);
					$('#docu_base_state').val('0');

					// 공람자 정보
					$('#open_men_id').val(record.open_men_id);
					$('#open_men_nm').val(record.open_men_nm);


					$('#keyword').val(record.keyword);

					$('#rqt_wdate').val(record.rqt_wdate);
					$('#rqt_busil').val(record.rqt_busil);
					$('#rqt_nm').val(record.rqt_nm);
					$('#est_code').val(record.est_code);
					$('#parm').val( record.parm );
		
		
					if(record.pum_id && 11 == Number(record.pum_id)){
					
						$('#docu_title_label').text('계약명');
						$('#docu_title').attr('placeholder','계약명을 입력하십시오.');

						$('#cnt_saup_numb').val(record.est_code);

						$('#cnt_start_date').val(record.va_start_date);
						$('#cnt_end_date').val(record.va_end_date);
	
						$('#cnt_bozung').prop('checked', ('Y' == record.va_sort_1));
						$('#cnt_bozung2').prop('checked', ('Y' == record.va_sort_2));
						$('#cnt_bozung3').prop('checked', ('Y' == record.va_sort_3));

						LoadTemplateContents4OpenBid(record.docu_id)
					}
					
					//상태 변경 및 결재완료시, 전자입찰 시스템으로 상태값을 회신하기 위해서 계약코드를 유지한다.
					$('#contract_code').val(record.ref_docu_id);
					//새로운 문서번호를 생성한다.
					$('#temp_docu_id').val(record.docu_id);
					$('#docu_id').val('');
					getNextDocuID();

					
				});

			}

		}

	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		}, function() {
			if (result.responseJSON.result == -99)
				$(location).attr('href', '/');
		});
	}).complete(function() {
		   	$('[data-ax5picker="register"]').ax5picker(myPicker);
		    $('[data-ax5picker="basic"]').ax5picker(mySinglePicker);
	});

}

function loadShareUser(docu_id) {

	$.post('/PopupAction.do?action=LoadDocumentShareInfo', 'docu_id=' + docu_id).success(function(response) {

		if (response.result < 0) {
			myToast.push(response.message);
			//myDialog.alert({title: "알림!", msg: msgShare, width:300});
		} else {
			
			
			var mens = [];
	
			$(JSON.parse(response.data)).each(function(i, user) {
				
					var men = {};
					men["_code"] = user.user_id;
					men["_name"] = user.user_nm;
					men["men_level"] = user.men_level;
					men["team_name"] = user.team_name;
					mens.push(men);
			});
			add_share_user_callback(mens);
			
		}
		
	}).error(function(result, error) {
		myDialog.alert({title: "알림!", msg: result.responseJSON.message, width:300},function(){
			if (result.responseJSON.result == -99) $(location).attr('href', '/');
		});
	}).complete(function() {
	});
}

function loadDocLink(docu_id, action, target) {
	var rsDocLink = [];

	$.post('/ApprovalAction.do?action=' + action, 'docu_id='+docu_id 
	).success(function(response) {
		
		if (response.result < 0) {
			myToast.push(response.message);
			if (response.result == -9) {
				$('#' + target + '_block').css('display', 'none');
			}
		} else {
			
			rsDocLink = JSON.parse(response.data);
			
			if (rsDocLink.length < 1){
				myDialog.alert({title: "알림!", msg: "참조문서 정보가 존재하지 않습니다.", width:300});
			}else{
				init_document_link(rsDocLink, target);		
			}
			
		}
		
	}).error(function(result, error) {
		myDialog.alert({title: "알림!", msg: result.responseJSON.message, width:300},function(){
			if (result.responseJSON.result == -99) $(location).attr('href', '/');
		});
	}).complete(function() {
	});

}

function init_document_link(list, target) {

	var docu_id_list = [];
	$(list).each(function(i, record) {


			var html = [];
			html.push('<div class="relation_documents" id="rel_' + record.docu_id + '" title="' + record.docu_num + ' : ' + record.docu_title + '">');
			//html.push('<a href="#" id="plus-' + record.docu_id + '" style="float:left;" onclick="append_contents(' + record.docu_id + ', ' + record.docu_num + ', \''+record.docu_title+'\');"><i class="fa fa-plus" aria-hidden="true"></i></a>');
			html.push('<a href="#" onclick="$(\'#rel_' + record.docu_id + '\').remove();regeneration_relation_documents();"><i class="fa fa-times" aria-hidden="true"></i></a>');
			html.push('<span style="cursor:pointer;" onclick="open_documents(' + record.docu_id + ', \'' +  record.docu_title  + ' \' , '+record.docu_base_state+');">' + record.docu_title +'</span>');
			html.push('</div>');
	
			docu_id_list.push(record.docu_id);
			$('#'+target).append(html.join('\n'));
	});

	$('#relation_documents').val( docu_id_list.join(';') );
	
	$('#'+target+'_block').css('display', (list.length > 0 ? '' : 'none') );

}

function detail_view(est_code){
	var width = 900;
	var height = 800;
	var left = screen.width / 2 - (width / 2);
	var top = screen.height / 2 - (height / 2);

	if ( est_code.indexOf('B') >= 0 ){
		window.open("http://bid.doore.co.kr/admin/bid_gongzi_exe.asp?bid_code=" + est_code, 'bid_detail', 'location=no, menubar=no, status=no, toolbar=no, width='+width+', height='+height+', left='+left+',top='+top);
	}else{
		
		var param = "est_code=" + est_code + "&mode=view";
		var url = '/contract/estimate_view.jsp';
		var caller = search_parent(window);
		caller.call_search_popup(url, '', '', param, '견적조회', 900, 800);
		
	}
	
}

function openbid_detail_view(bid_code){
	var width = 900;
	var height = 800;
	var left = screen.width / 2 - (width / 2);
	var top = screen.height / 2 - (height / 2);

	if ( bid_code.indexOf('B') >= 0 ){
		window.open("https://openbid.doore.co.kr/admin/frame_index.php?code=show_bid_inform&bidcode=" + bid_code, 'bid_detail', 'location=no, menubar=no, status=no, toolbar=no, width='+width+', height='+height+', left='+left+',top='+top);
	}else{
		window.open("https://openbid.doore.co.kr/admin/frame_index.php?code=show_estimate_detail&est_code=" + bid_code, 'est_detail', 'location=no, menubar=no, status=no, toolbar=no, width='+width+', height='+height+', left='+left+',top='+top);
	}
	
}

function LoadContract(cnt_num, arg_docu_id) {
	var param = 'docu_id=' + arg_docu_id;
	param += '&cnt_num=' + cnt_num;
	
	$.post('/ContractAction.do?action=ContractList', param
	).success(function(response) {
		
		if (response.result < 0) {
			myDialog.alert({
				title : "알림!",
				msg : response.message,
				width : 300
			});
		} else {
			var rsContract = JSON.parse(response.data);
			$(rsContract).each(function(i, contract) {
				
				$('#cnt_id').val(contract.cnt_id);
				$('#cnt_start_date').val(contract.cnt_start_date);
				$('#cnt_end_date').val(contract.cnt_end_date);
				
				$('#cnt_bozung').prop('checked', ('Y' == contract.cnt_bozung));
				$('#cnt_bozung2').prop('checked', ('Y' == contract.cnt_bozung2));
				$('#cnt_bozung3').prop('checked', ('Y' == contract.cnt_bozung3));
			});

		}

	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		}, function() {
			if (result.responseJSON.result == -99)
				$(location).attr('href', '/');
		});
	}).complete(function() {
	});
}

function loadDocAppLine(arg_docu_id, mode) {

	$.post('/ApprovalAction.do?action=LoadDocAppLine', 'docu_id=' + arg_docu_id +'&modify=' + mode
	).success(function(response) {

		if (response.result < 0) {
			myDialog.alert({
				title : "알림!",
				msg : response.message,
				width : 300
			});
		} else {
			var rsDocAppLine = JSON.parse(response.data);
			init_approval_line(rsDocAppLine);
		}

	}).error(function(result, error) {
		if('copy'==mode) {
			myDialog.alert({				title : "알림!",				msg : result.responseJSON.message,				width : 300			}, function(){
				if(selectApprovalLine )selectApprovalLine();
			});
		}else{
			myToast.push( result.responseJSON.message );
		}
	}).complete(function() {
	});
}

function init_approval_line(list) {
	if (list.length < 1) {
		myDialog.alert({
			title : "알림!",
			msg : "결재라인을 설정할 사용자가 없습니다.",
			width : 300
		});
	} else {
		var group = -1;
		$('#app_line_title').html('');
		$('#app_line_users').html('');

		$('#approval_line').val(JSON.stringify(list));

		$(list).each(function(i, user) {
			if (group != user.appgroup) {
				group = user.appgroup;
				if (user.appgroup == 0)
					$('#app_line_title').append('<th class="app_line_group" rowSpan=2>합<BR><BR>의</th>');
				if (user.appgroup == 1)
					$('#app_line_title').append('<th class="app_line_group" rowSpan=2>결<BR><BR>재</th>');
			}
			$('#app_line_title').append('<th class="app_line_step">' + user.docu_app_men_level + ('후결' == user.docu_app_sort ? "<span style='color:orangered;'>(후결)</span>" : "") + '</th>');
			$('#app_line_users').append('<td class="app_line_user">' + user.docu_app_user_nm + '<br>' + user.docu_check_wdate + '</td>');
		});

		// 결재자 인원수를 기준으로 각 셀의 너비를 계산한다.
		$('.app_line_step').css('width', Math.round(100 / list.length, 1) + '%')
		// $('#approval_request_list').trigger("create");
	}

	// 결재라인 표시영역의 넓이를 기준으로 컨텐츠 영역의 넓이를 조정한다.
	var w = $('#document_approval_lines_tb').width();
	if (w > $('#document_contents_body_tb').width()) {
		$('#document_contents_body_tb').css('width', w);
		$('#document_contents_body_tb tbody').css('width', w);
	}
}

/**
 * 팝업화면에서 다시 팝업을 오픈할때는 팝업 호출 공통 모듈인 call_search_popup 함수가 어디에 정의 되어 있는지 상위 객체에서
 * 검색한다.
 * 
 * @param caller
 * @returns
 */
function search_parent(caller) {
	if (caller['call_search_popup']) {
		return caller;
	} else if (caller != caller.parent) {
		return search_parent(caller.parent);
	} else {
		myDialog.alert({
			title : "오류!",
			msg : "검색 팝업화면 호출함수가 정의되지 않았습니다.",
			width : 300
		});
		return caller;
	}
}

/**
 * 사용자를 검색하여 사원번호를 리턴받는다. 휴가자 및 부담당자 검색에 사용함. 사용자 아이디를 리턴받고자 할 경우에는 parameter에
 * codeColName=user_id를 지정해서 넘기거나 파라미터를 넘기지 않으면 기본값으로 아이디를 사용함.
 * 
 * @param codeObj -
 *            사원번호를 설정할 input 태그.
 * @param nameObj -
 *            성명을 설정할 input 태그.
 * @returns 사원번호
 */
function search_single_user(codeObj, nameObj, callback) {
	var caller = search_parent(window);
	// 기본값은 user_id를 code로 리턴받지만
	// 다른 정보가 필요한 경우 해당 컬럼명을 지정하여 호출한다.
	// 가령 직원검색 후 전화번호를 코드로 input hidden필드로 리턴 받고 싶으면 codeColName=mobile로 요청한다.
	caller.call_search_popup('/popup/member_search.jsp', codeObj, nameObj, 'codeColName=empl_code' + (callback ? '&callBack=' + callback : ''), '직원검색', 700, 600);
}

function view_vacation_list() {
	var caller = search_parent(window);
	var param = 'userid=' + ($('#va_sabun').val() ? $('#va_sabun').val() : '');
	var title = ($('#va_sabun_nm').val() ? '"' + $('#va_sabun_nm').val() + '"님의 휴가내역' : '나의 휴가내역');
	caller.call_search_popup('/popup/vacation_viewer.jsp', '', '', param, title, 550, 700);
}

function search_estimate(codeObj, nameObj) {
	$('input.old_bidding').css('display', '');	
	$('input.open_bidding').css('display', 'none');	

	var caller = search_parent(window);
	caller.call_search_popup('/contract/estimate_search_popup.jsp', codeObj, nameObj, '', '전자견적 찾기', 1000, 900);
}

function search_bid(codeObj, nameObj) {
	$('input.old_bidding').css('display', '');	
	$('input.open_bidding').css('display', 'none');	

	var caller = search_parent(window);
	caller.call_search_popup('/contract/bid_search_popup.jsp', codeObj, nameObj, '', '전자입찰 찾기', 1000, 900);
}

function search_OpenBidding(codeObj, nameObj) {
	$('input.old_bidding').css('display', 'none');	
	$('input.open_bidding').css('display', '');	
	
	var caller = search_parent(window);
	caller.call_search_popup('/contract/openbid_search_popup.jsp', codeObj, nameObj, '', '전자입찰 찾기', 1000, 900);
}

function search_OpenEstimate(codeObj, nameObj) {
	$('input.old_bidding').css('display', 'none');	
	$('input.open_bidding').css('display', '');	
	
	var caller = search_parent(window);
	caller.call_search_popup('/contract/openest_search_popup.jsp', codeObj, nameObj, '', '전자견적 찾기', 1000, 900);
}

function search_document() {
	var caller = search_parent(window);
	caller.call_search_popup('/popup/document_search.jsp', '', '', 'mode=end&callBack=search_document_callback', '관련문서 찾기', 900, 800);
}

function search_document_callback(list) {
	//console.log(list);
	var old = $('#relation_documents').val();

	$(list).each(function(i, record) {

		if(old.indexOf(record._code) == -1){

			var html = [];
			html.push('<div class="relation_documents" id="rel_' + record.docu_id + '" title="' + record.docu_num + ' : ' +  record.docu_title + '">');
			html.push('<a href="#" id="plus-' + record.docu_id + '" style="float:left;" onclick="append_contents(' + record.docu_id + ', ' + record.docu_num + ', \''+record.docu_title+'\');"><i class="fa fa-plus" aria-hidden="true"></i></a>');
			html.push('<a href="#" onclick="$(\'#rel_' + record.docu_id + '\').remove();regeneration_relation_documents();"><i class="fa fa-times" aria-hidden="true"></i></a>');
			html.push('<span style="cursor:pointer;" onclick="open_documents(' + record.docu_id + ', \'' +  record.docu_title  + ' \' , '+record.docu_base_state+');">' + record.docu_title +'</span>');
			html.push('</div>');
	
			$('#relation_documents_list').append(html.join('\n'));
			
		}

	});
	regeneration_relation_documents();
}

function append_contents(docu_id, docu_num, title){
	//var http://portal.doore.co.kr/approval/dooreform/pum_ing_detail.asp?docu_id=112296&pum_id=6&mode=view&rtn_mode=
	
	var url = '/approval/approval_view.jsp?docu_id='+docu_id;
	var html = '<p>참조할문서 ( 문서번호 : <a href="' + url + '" title="'+title+'" target="_blank" >' + docu_num + '</a>)</p>';	
	
	CHEditor.outputBodyHTML();
	var original = $('#docu_detail_long').val();

	$('#docu_detail_long').val(original + html);
	CHEditor.putContents(original + html);
	$('#plus-' + docu_id).remove();
}

function regeneration_relation_documents(){
	var relation_documents = []; 
	$("#relation_documents_list div").each(function(i, obj){ 
		relation_documents.push(obj.id.replace('rel_', ''));
	}); 
	$('#relation_documents').val(relation_documents.join(';'));
}

function open_documents(docu_id, title, docu_base_state){
	
	var param = 'docu_id=' + docu_id;
	param += '&mode=view';
	param += '&docu_base_state=' + docu_base_state;
	
	var caller = search_parent(window);
	caller.call_search_popup('/approval/approval_view.jsp', '', '', param, title, 1200, 900);
}

/**
 * 휴가자를 검색해서 변경한 경우에는 변경된 사번을 이용하여 휴가 잔여일수 정보를 다시 조회하도록 한다.
 * 
 * @param _result
 * @returns
 */
function changeVacationUser(_result) {
	$('#va_sabun').val(_result._code);
	$('#va_sabun_nm').val(_result._name);

	LoadVacationRemainder();

}

function search_sub_user(codeObj, nameObj, callback) {
	var caller = search_parent(window);
	// 기본값은 user_id를 code로 리턴받지만
	// 다른 정보가 필요한 경우 해당 컬럼명을 지정하여 호출한다.
	// 가령 직원검색 후 전화번호를 코드로 input hidden필드로 리턴 받고 싶으면 codeColName=mobile로 요청한다.
	caller.call_search_popup('/popup/member_search.jsp', codeObj, nameObj, '' + (callback ? '&callBack=' + callback : ''), '직원검색', 700, 600);
}

function changeSubUser(_result) {
	$('#va_busabun').val(_result.empl_code);
	$('#va_buname').val(_result._name);

	
	
	var app_line = $('#approval_line').val();
	
	
	if(app_line.indexOf(  _result._code  ) < 0 ){
		
		
		
		//부담당자가 사번이 결재라인의 병렬합의자에 없으면 추가한다.
		
		var list = [];
		try {
			list = JSON.parse(app_line);
		}catch(e){
			console.log(e);
		}
		
		var user = {};
		user["docu_app_men_level"] = "부담당자<br>(병렬합의)";
		user["docu_app_orderby"] = "0";
		user["docu_app_sort"] = "병렬합의";
		user["docu_app_team_name"] =  "";
		user["docu_app_user_id"] = _result._code;
		user["docu_app_user_nm"] = _result._name;
		
		//list.unshift( user );
		list.push( user );

		ApplyApprovalLine( JSON.stringify( list ) );

	}
	

	
}
/**
 * 공람지정을 위해서 사용자를 추가로 검색한다.
 * 
 * @returns
 */
function open_add_user() {
	var caller = search_parent(window);
	// 공람자 정보는 사원번호가 아닌 user_id를 사용한다.
	caller.call_search_popup('/popup/member_search.jsp', '', '', 'callBack=add_share_user_callback', '공람자 찾기...', 700, 600);
}

function add_share_user_init(open_men_id, open_men_nm) {
	var ids = [], nms = [], mens = [];
	ids = open_men_id.split(';');
	nms = open_men_nm.split(';');
	
	var old = $('#open_men_id').val();

	$(ids).each(function(i, id) {
		
		if (old.indexOf(id) == -1 && id) {// id가 정상인 경우만...
			var men = {};
			men["_code"] = id;
			men["_name"] = nms[i];
			men["men_level"] = '';
			men["team_name"] = '';
			mens.push(men);
		}
	});
	add_share_user_callback(mens);
}

/**
 * 검색결과를 리턴 받아 화면에 표시한다.
 * 
 * @param list
 * @returns
 */
function add_share_user_callback(list) {
	//console.log(list);
	// [{_code: "1201305169", _name: "정재홍", men_level: "과장", team_name:
	// "정보전산팀"}]
	var open_men_id = []; 
	$("#share_user_list div").each(function(i, obj){ 
		open_men_id.push(obj.id);
	}); 
	$('#open_men_id').val(open_men_id.join(';')+';');
	var old = $('#open_men_id').val();

	$(list).each(function(i, record) {

		if(old.indexOf(record._code) == -1){

			var html = [];
			html.push('<div class="share_user_item" id="' + record._code + '" title="' + record.team_name + ' / ' + record.men_level + '">' + record._name + '');
			html.push('<a href="#" onclick="$(\'#' + record._code + '\').remove();">');
			html.push('<i class="fa fa-times" aria-hidden="true"></i>');
			html.push('</a>');
			html.push('</div>');
	
			$('#share_user_list').append(html.join('\n'));
			
		}

	});
	
	var open_men_id = []; 
	$("#share_user_list div").each(function(i, obj){ 
		open_men_id.push(obj.id);
	}); 
	$('#open_men_id').val(open_men_id.join(';')+';');

}

function loadDocContents(arg_docu_id) {
	$.post('/ApprovalAction.do?action=LoadDocContents', 'docu_id=' + arg_docu_id, function(data) {
		data = data.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gi,'');
		$('#docu_detail_long').val(data);
		CHEditor.putContents(data);
	}).success(function() {
	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		});
	}).complete(function() {
	});
}

function LoadTemplateContents4Contract(tmp_id, saup_numb){
	$.post('/TemplateAction.do?action=LoadTemplateContents4Contract', 'tmp_id=' + tmp_id + '&saup_numb=' + saup_numb, function(data) {
		data = data.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gi,'');
		$('#docu_detail_long').val(data);
		$('#cnt_saup_numb').val(saup_numb);
		CHEditor.putContents(data);
	}).success(function() {
	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		});
	}).complete(function() {
	});
}

function LoadTemplateContents4OpenBid(docu_id){
	$.post('/OpenBidInterfaceAction.do?action=LoadReadyDocContents', 'docu_id=' + docu_id , function(data) {
		data = data.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gi,'');
		$('#docu_detail_long').val(data);
		///$('#cnt_saup_numb').val(saup_numb);
		CHEditor.putContents(data);
	}).success(function() {
	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		});
	}).complete(function() {
	});
}

/**
 *  [{
 * @first: true
 * @i: 0 download: "/upload_data/ax5/temp/105859.사용자.접수하기.02.png"
 *     fileSize: "217280" name: "105859.사용자.접수하기.02.png" saveName:
 *     "105859.사용자.접수하기.02.png" thumbUrl:
 *     "/upload_data/ax5/temp/105859.사용자.접수하기.02.png" type: "png" },
 *     ...]
 */

function loadDocAttachFiles(arg_docu_id) {

	$.post('/ApprovalAction.do?action=LoadDocAttachFiles', 'docu_id=' + arg_docu_id
	).success(function(response) {

		if (response.result < 0) {
			// myDialog.alert({title: "알림!", msg: msgDocAttFile, width:300});
			myToast.push(response.message);
			if (response.result == -9) {
				$('.attach_file_block').css('display', 'none');
			}
		} else {
			var rsDocAttFile = JSON.parse(response.data);
			
			Ax5Uploader.setUploadedFiles(rsDocAttFile);
		}

	}).error(function(result, error) {
		myDialog.alert({
			title : "알림!",
			msg : result.responseJSON.message,
			width : 300
		}, function() {
			if (result.responseJSON.result == -99)
				$(location).attr('href', '/');
		});
	}).complete(function() {
	});

}


function loadDocItemList(arg_docu_id) {
	
	$.post('/ApprovalAction.do?action=LoadDocumentItemlList', 'docu_id=' + arg_docu_id
	).success(function(response) {

		var list = JSON.parse(response.data);
		
		AXGridItem.setData(list);

	}).error(function(result, error) {
		myDialog.alert({title : "알림!",	msg : result.responseJSON.message,width : 300}, function() {
			if (result.responseJSON.result == -99)	$(location).attr('href', '/');
		});
	}).complete(function() {
	});
}