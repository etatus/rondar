<?php
	$coords = (isset($_GET['coords'])) ? $_GET['coords'] : false;
	if(!$coords) exit;
	header('Content-Type: application/json');
	$string = file_get_contents("https://api.darksky.net/forecast/<your-darksky-api-code>/".$coords);
	echo $string;
?>
