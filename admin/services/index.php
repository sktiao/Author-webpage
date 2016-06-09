<?php
	include "config.php";
	include "functions.php";
	
	$post = file_get_contents("php://input");
	$data = json_decode($post);
	
	include "appServices.php";
	include "productListServices.php";
?>