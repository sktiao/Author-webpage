<?php
	$name = $_POST["addCategoryImage-name"];
	$image = base64_encode($name);
	move_uploaded_file($_FILES["addCategoryImage-image"]["tmp_name"], "../../img/categoryList/".$image.".jpg");
?>