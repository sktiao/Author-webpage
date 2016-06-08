<?php
	$name = $_POST["updateCategoryImage-name"];
	$image = base64_encode($name);
	move_uploaded_file($_FILES["updateCategoryImage-image"]["tmp_name"], "../../img/categoryList/".$image.".jpg");
?>