<?php
	if ($post->request == "getStockDetails") {
		if (property_exists($post,"data") && property_exists($post->data,"symbol")) {
			$lines = file("http://ichart.finance.yahoo.com/table.csv?s=".$post->data->symbol);
			echo(json_encode($lines));
		} else {
			echo("no data or symbol");
		}
	}
?>