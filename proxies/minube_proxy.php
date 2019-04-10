<?php
	$url = (isset($_GET['url'])) ? $_GET['url'] : false;
	if(!$url) exit;
	header('Content-Type: application/json');
	$string = file_get_contents($url."&api_key=<minube-api-code>");
	echo $string;
?>
