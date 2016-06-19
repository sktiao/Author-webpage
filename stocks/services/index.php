<?php
	include "config.php";
	include "functions.php";
	
	$post = json_decode(file_get_contents("php://input"));
	
	if (property_exists($post,"request")) {
		refreshToken();
		include "appServices.php";
		include "registerServices.php";
		include "loginServices.php";
		include "stocksServices.php";
		
	} else {
		echo("no request");
	}
?>