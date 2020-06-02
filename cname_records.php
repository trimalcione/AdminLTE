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
                <h1 class="m-0 text-dark">Local CNAME Records</h1>
                <h2 class="h4">On this page, you can add CNAME records.</h2>
            </div>
        </div>
    </div>
</div>

<div class="content">
    <div class="container-fluid">
        <!-- Domain Input -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="card card-outline card-secondary">
                    <div class="card-header">
                        <h3 class="card-title">Add a new CNAME record</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="domain">Domain:</label>
                                <input id="domain" type="url" class="form-control" placeholder="Add a domain (example.com or sub.example.com)" autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="target">Target Domain:</label>
                                <input id="target" type="url" class="form-control" placeholder="Associated Target Domain" autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off">
                            </div>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-md-end">
                        <button type="button" id="btnAdd" class="btn btn-primary">Add</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Alerts -->
        <div id="alInfo" class="alert alert-info alert-dismissible fade d-none" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            Updating CNAME records...
        </div>
        <div id="alSuccess" class="alert alert-success alert-dismissible fade d-none" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            Success! The list will refresh.
        </div>
        <div id="alFailure" class="alert alert-danger alert-dismissible fade d-none" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            Failure! Something went wrong, see output below:<br/><br/>
            <pre class="bg-light">
                <span id="err"></span>
            </pre>
        </div>
        <div id="alWarning" class="alert alert-warning alert-dismissible fade d-none" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            At least one domain was already present, see output below:
            <br/><br/>
            <pre class="bg-light">
                <span id="warn"></span>
            </pre>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card card-outline card-secondary" id="recent-queries">
                    <div class="card-header">
                        <h3 class="card-title">List of local CNAME records</h3>
                    </div>
                    <div class="card-body">
                        <table id="customCNAMETable" class="table table-striped table-bordered w-100">
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>Target</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                        </table>
                        <button type="button" id="resetButton" class="btn btn-danger btn-sm my-2 d-none">Clear Filters</button>
                    </div>
                </div>
            </div>
        </div>
    </div> <!-- /.container-fluid -->
</div> <!-- /.content -->


<script src="scripts/pi-hole/js/utils.js"></script>
<script src="scripts/pi-hole/js/customcname.js"></script>

<?php
    require "scripts/pi-hole/php/footer.php";
?>
