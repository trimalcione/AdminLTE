<?php /*
*    Pi-hole: A black hole for Internet advertisements
*    (c) 2019 Pi-hole, LLC (https://pi-hole.net)
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
                <h1 class="m-0 text-dark">Client group management</h1>
            </div>
        </div>
    </div>
</div>

<div class="content">
    <div class="container-fluid">
        <!-- Domain Input -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="card card-outline card-secondary" id="add-client">
                    <div class="card-header">
                        <h3 class="card-title">Add a new client</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="select">Known clients:</label>
                                <select id="select" class="form-control" placeholder="">
                                    <option disabled selected>Loading...</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="new_comment">Comment:</label>
                                <input id="new_comment" type="text" class="form-control" placeholder="Client description (optional)">
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-center text-lg-right">
                        <button type="button" id="btnAdd" class="btn btn-primary">Add</button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <p>You can select an existing client or add a custom one by typing into the field above and confirming your entry with <kbd>&#x23CE;</kbd>.</p>
                        <p>Clients may be described either by their IP addresses (IPv4 and IPv6 are supported),
                           IP subnets (CIDR notation, like <code>192.168.2.0/24</code>),
                           their MAC addresses (like <code>12:34:56:78:9A:BC</code>),
                           by their hostnames (like <code>localhost</code>), or by the interface they are connected to (prefaced with a colon, like <code>:eth0</code>).</p>
                        <p>Note that client recognition by IP addresses (incl. subnet ranges) are prefered over MAC address, host name or interface recognition as
                           the two latter will only be available after some time.
                           Furthermore, MAC address recognition only works for devices at most one networking hop away from your Pi-hole.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card card-outline card-secondary" id="clients-list">
                    <div class="card-header">
                        <h3 class="card-title">List of configured clients</h3>
                    </div>
                    <div class="card-body">
                        <table id="clientsTable" class="table table-striped table-bordered w-100">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th title="Acceptable values are: IP address, subnet (CIDR notation), MAC address (AA:BB:CC:DD:EE:FF format) or host names.">Client</th>
                                    <th>Comment</th>
                                    <th>Group assignment</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                        </table>
                        <button type="button" id="resetButton" class="btn btn-danger btn-sm my-2 d-none">Reset sorting</button>
                    </div>
                </div>
            </div>
        </div>
    </div> <!-- /.container-fluid -->
</div> <!-- /.content -->

<script src="scripts/vendor/bootstrap-select.min.js?v=<?=$cacheVer?>"></script>
<script src="scripts/vendor/bootstrap-toggle.min.js?v=<?=$cacheVer?>"></script>
<script src="scripts/pi-hole/js/ip-address-sorting.js?v=<?=$cacheVer?>"></script>
<script src="scripts/pi-hole/js/utils.js?v=<?=$cacheVer?>"></script>
<script src="scripts/pi-hole/js/groups-clients.js?v=<?=$cacheVer?>"></script>

<?php
    require "scripts/pi-hole/php/footer.php";
?>
