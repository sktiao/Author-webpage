<?php
	function generateToken($username) {
		$header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
		$claims = "{\"user\":\"".$username."\",\"exp\":\"".(time()+TOKEN_LIFESPAN)."\"}";
		$payload = base64_encode($header).".".base64_encode($claims);
		$signature = hash_hmac("sha256",$payload,TOKEN_KEY);
		$token = $payload.".".$signature;
		return $token;
	}
	
	function verifyToken($token) {
		if ($arr = explode(".",$token)) {
			if (count($arr) === 3) {
				$payload = $arr[0].".".$arr[1];
				$signature = $arr[2];
				if ($signature === hash_hmac("sha256",$payload,TOKEN_KEY)) {
					$claims = json_decode(base64_decode($arr[1]));
					if ($claims->exp > time()) {
						return true;
					}
				}
			}
		}
		return false;
	}
	
	function checkToken() {
		if (array_key_exists("token",$_COOKIE)) {
			$token = $_COOKIE["token"];
			if (verifyToken($token)) {
				return $token;
			}
		}
		return false;
	}
	
	function refreshToken() {
		if ($token = checkToken()) {
			$username = getTokenClaims($token)->user;
			$token = generateToken($username);
			setcookie("token",$token,time()+TOKEN_LIFESPAN);
		}
	}
	
	function getTokenClaims($token) {
		$claims = json_decode(base64_decode(explode(".",$token)[1]));
		return $claims;
	}
?>