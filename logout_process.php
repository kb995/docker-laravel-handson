<?php
require_once("config.php");

debug('「「「「「「「「「「「');
debug('「　ログアウトページ「');
debug('「「「「「「「「「「「');
debugLogStart();

require_once('auth.php');

if (isset($_SESSION['user_id'])) {
  session_destroy();
  session_start();
  $_SESSION['flash']['type'] = 'flash_sucsess';
  $_SESSION['flash']['message'] = 'ログアウトしました';
  debug('ログアウト成功');
  debug('セッション変数の中身：'.print_r($_SESSION,true));

  header('Location:login_form.php');
}
