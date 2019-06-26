$(function(){

  // 改行コードをカウントして行数を取得する
  function get_line_count(str){
    return str.match(/\n/g) ? str.match(/\n/g).length + 1 : 1;
  }

  //メッセージを表示
  function show_slide_message(flash_type,flash_message){
    $message = ('#js_show_msg');
    // クラスがまだない場合渡されたクラスを入れる
    if(!$($message).hasClass('flash_error')
    && !$($message).hasClass('flash_sucsess')){
      $($message).addClass(flash_type);
    // すでにクラスがあって同じクラスを渡していた場合は何もしない
  }else if( $($message).hasClass('flash_error') && flash_type === 'flash_error'
    || $($message).hasClass('flash_sucsess') && flash_type === 'flash_sucsess'){
    // 既にクラスがあって別のクラスを渡していた場合は入れ替える
    }else{
      $($message).toggleClass('flash_error');
      $($message).toggleClass('flash_sucsess');
    }
    // 渡されたメッセージを表示させる
    $($message).text(flash_message);
    $($message).slideToggle('slow');
    setTimeout(function(){ $($message).slideToggle('slow'); }, 2000);
  }

  // getパラメータ取得
  function get_param(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  //================================
  // 投稿全文表示機能
  //================================

  $(document).on('click','.show_all',function(){
    // 省略されている投稿の高さを取得
    let omit_height = $(this).parent().height();
    //投稿の省略を解除
    $(this).prev().removeClass('ellipsis');
    // 全文表示された投稿の高さを取得
    let all_height = $(this).parent().height();
    //一度高さを戻して
    $(this).parent().height(omit_height);
    //スライドで全文表示させる
    $(this).parent().animate({
      height: all_height
    },"slow","swing");

    //ボタンを消す
    $(this).remove()
  });

  //================================
  // 投稿フォーム
  //================================
  // フォーカス時に入力フォームを拡大して投稿ボタンを出す
  $('.textarea').on('focus',function(){
    $(this).addClass('show_textarea');
    $('#post_btn').show();
  });

  //フォームに入力がなければ入力フォームとボタンを戻す
  $('.textarea').on('focusout',function(){
    if ($('.textarea').val().length === 0){
      $(this).removeClass('show_textarea');
      $(this).css('height','24px');
      $('#post_btn').hide();
    }
  });

  //フォームに入力があるときだけ投稿ボタンを活性化
  $('.textarea').on('input',function(){
    if ($('.textarea').val().length !== 0){
      $('#post_btn').prop('disabled',false);
    }else{
      $('#post_btn').prop('disabled',true);
    }
  })

  // フォームの高さを自動調整(拡大のみ、縮小も実装したい)
  $('.textarea').on('input',function(){
  let scroll_height = $(this).get(0).scrollHeight;
  let offset_height = $(this).get(0).offsetHeight;

  if( scroll_height > offset_height ){
    $(this).css('height',scroll_height +"px");
  }

})


  //================================
  // 投稿削除
  //================================
  // モーダルウィンドウを開く処理
  $(document).on('click',".delete_btn",function(){
      let $target_modal = $(this).data("target"),
          $modal_content = $(this).next().find('.post_content'),
          line_count = get_line_count($modal_content.text());
      //背景をスクロールできないように　&　スクロール場所を維持
      scroll_position = $(window).scrollTop();
      $('body').addClass('fixed').css({'top': -scroll_position});
      // モーダルウィンドウを開く
      $($target_modal).fadeIn();
      //投稿の行数が一定以上ならスクロールできるように
      if( line_count > 10){
        $modal_content.css('overflow','auto');
      }else{
        $modal_content.css('overflow','');
      }
        return false;
  });

  // モーダルウィンドウを閉じる処理
  $(document).on('click',".modal_close",function(){
    // スクロール場所を維持
    $('body').removeClass('fixed').css({'top': 0});
    window.scrollTo( 0 , scroll_position );
    // モーダルウィンドウを閉じる
    $(this).parents(".modal").fadeOut();
      return false;
  });

  //================================
  // フォローボタン
  //================================
  let first_flg = 0;

  $(document).on('mouseenter','.following',function(){
    $(this).text('解除');
    $(this).toggleClass('following');
    $(this).toggleClass('unfollow');
    first_flg = 1;
  });

  $(document).on('mouseleave','.unfollow',function(){
    if (first_flg === 1) {
      $(this).text('フォロー中');
      $(this).toggleClass('following');
      $(this).toggleClass('unfollow');
      first_flg = 0;
    }
  });

  //================================
  // アイコン変更
  //================================

  $('.profile_icon > img').on('mouseenter',function(){
    $('.edit_icon').css('display','block');
  })

  //画像が無くなった時も操作できるように
  $('.profile_icon').on('mouseenter',function(){
    $('.edit_icon').css('display','block');
  })

  $('.edit_icon').on('mouseleave',function(){
    $('.edit_icon').css('display','none');
  })

  $('.icon_upload_btn').on('click',function(){
    $('.icon_upload').click();
  })

  $('.edit_icon').on('click',function(){
    $('.edit_icon_menu').toggleClass('open');
  });


  //================================
  // ajax処理
  //================================


  //お気に入り登録処理
  $(document).on('click','.favorite_btn',function(e){
    e.stopPropagation();
    let $this = $(this),
        $profile_count = $('.profile_count + .favorite > a > .count_num'),
        page_id = get_param('page_id'),
        post_id = $this.prev().val();

    $.ajax({
        type: 'POST',
        url: 'ajax_post_favorite_process.php',
        dataType: 'json',
        data: { favorite: true,
                page_id: page_id,
                post_id: post_id}
    }).done(function(phpreturn){
      // php側でエラーが発生したらリロードしてエラーメッセージを表示させる
      if(phpreturn ==="error"){
        location.reload();
      }else{
        // プロフィール内のカウントを更新する
        $profile_count.text(phpreturn['profile_count']);
        // 投稿内のカウントを更新する
        $this.next('.post_count').text(phpreturn['post_count']);
        // アイコンを切り替える
        $this.children('i').toggleClass('fas');
        $this.children('i').toggleClass('far');
      }
    }).fail(function() {
      location.reload();
    });
  });

  // フォロー登録、解除処理
  $('.follow_btn').on('click',function(e){
    e.stopPropagation();
    let $this = $(this),
        $follow_count = $('.profile_count + .follow > a > .count_num'),
        $follower_count = $('.profile_count + .follower > a > .count_num'),
        profile_user_id = $('.profile_user_id').val();
        user_id = $this.prev().val();

    $.ajax({
        type: 'POST',
        url: 'ajax_follow_process.php',
        dataType: 'json',
        data: { follow: true,
                profile_user_id: profile_user_id,
                user_id: user_id}
    }).done(function(phpreturn){
      // php側の処理に合わせてボタンを更新する
      // php側でエラーが発生したらリロードしてエラーメッセージを表示させる
      if(phpreturn === "error"){
        location.reload();
      }else if(phpreturn['action'] ==="登録"){
        $this.toggleClass('following')
        $this.text('フォロー中');
      }else if(phpreturn['action'] ==="解除"){
        $this.removeClass('following');
        $this.removeClass('unfollow')
        $this.text('フォロー');
      }
      // プロフィール内のカウントを更新する
      $follow_count.text(phpreturn['follow_count']);
      $follower_count.text(phpreturn['follower_count']);
    }).fail(function() {
      location.reload();
    });
  });

  //アイコン加工
  $('.icon_upload').on('change',function(e){
   e.stopPropagation();
   let max_file_size = 10485760;

   // ファイルサイズ制限
   if (max_file_size < this.files[0].size){
     show_slide_message('flash_error','ファイルサイズは10M以下にしてください');
     $(this).val('');
   }else{
     // フォームデータを取得
     let formdata = new FormData($('#icon_form').get(0));
     $.ajax({
       type: 'POST',
       url: 'ajax_icon_create.php',
       dataType: 'json',
       data: formdata,
       cache       : false,
       contentType : false,
       processData : false
     }).done(function(data){
       // アイコンを返ってきた加工済みアイコンと入れ替える
       $('.profile_icon > img').attr('src',data);
       $(".icon_save").prop('disabled', false);
     }).fail(function(){
      location.reload();
     });
   }
  });

  //アイコン保存
  $('.icon_save').on('click',function(e){
    e.stopPropagation();
    let icon_data = $('.profile_icon > img').attr('src'),
        user_id = $(this).data('user_id');

    $.ajax({
      type: 'POST',
      url: 'ajax_icon_save.php',
      dataType: 'json',
      data: {icon_save: true,
             icon_data: icon_data,
             user_id: user_id}
    })
    .done(function(){
      location.reload();
    }).fail(function(){
      location.reload();
    });
  });

  //最後までスクロールしたら投稿を取得する
  offset= 10;
  $(window).on('scroll', function () {
  let doch = $(document).innerHeight(), //ページ全体の高さ
      winh = $(window).innerHeight(), //ウィンドウの高さ
      bottom = doch - winh, //ページ全体の高さ - ウィンドウの高さ = ページの最下部位置
      page_id = get_param('page_id'),
      page_type = get_param('type');

  if (bottom <= $(window).scrollTop()) {

    $.ajax({
      type: 'POST',
      url: 'ajax_more_post.php',
      dataType: 'json',
      data: { more_posts: true,
              offset: offset,
              page_id: page_id,
              page_type: page_type}
    }).done(function(data){
      //投稿が返されていれば表示する
      $('.main_items').append(data['posts_html']);
      offset += data['posts_count'];
    }).fail(function(){

    })
  }

  });
});
