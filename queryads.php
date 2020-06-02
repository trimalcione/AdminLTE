<?php /*
*    Pi-hole: A black hole for Internet advertisements
*    (c) 2017 Pi-hole, LLC (https://pi-hole.net)
*    Network-wide ad blocking via your own hardware.
*
*    This file is copyright under the latest version of the EUPL.
*    Please see LICENSE file for your rights under this license. */
    require "scripts/pi-hole/php/header.php";
?>

<div class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-12">
                <h1 class="m-0 text-dark">Find Blocked Domain In Lists</h1>
            </div>
        </div>
    </div>
</div>

<div class="content">
    <div class="container-fluid">
        <div class="row mt-3">
          <div class="col-md-12">
            <div class="card card-outline card-secondary">
              <div class="card-body">
                <div class="form-group">
                <!-- Domain Input <992px -->
                  <div class="d-md-none">
                    <div class="input-group">
                      <input id="domain_1" type="url" class="form-control" placeholder="Domain to look for (example.com or sub.example.com)" autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off" style="margin-bottom: 5px">
                      <input id="quiet" type="hidden" value="no">
                      <div class="text-center" style="display: block; width: 100%">
                        <button type="button" id="btnSearch_1" class="btn btn-default">Search partial match</button>
                        <button type="button" id="btnSearchExact_1" class="btn btn-default">Search exact match</button>
                      </div>
                    </div>
                  </div>
                  <!-- Domain Input >=992px -->                 
                  <div class="d-none d-md-block">
                    <div class="input-group">
                      <input id="domain_2" type="url" class="form-control" placeholder="Domain to look for (example.com or sub.example.com)" autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off">
                      <span class="input-group-btn">
                        <button type="button" id="btnSearch_2" class="btn btn-default">Search partial match</button>
                        <button type="button" id="btnSearchExact_2" class="btn btn-default">Search exact match</button>
                      </span>
                    </div>
                  </div>                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <pre id="output" class="w-100 h-100 bg-light d-none"></pre>
    </div> <!-- /.container-fluid -->
</div> <!-- /.content -->

<script src="scripts/pi-hole/js/queryads.js?v=<?=$cacheVer?>"></script>

<?php
    require "scripts/pi-hole/php/footer.php";
?>
