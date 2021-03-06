var QCD = QCD || {};

QCD.orderDefinitionWizardContext = {};
QCD.orderDefinitionWizardContext.orderDefinitionWizardBody;
QCD.orderDefinitionWizardContext.order = {};
QCD.orderDefinitionWizardContext.order.product = null;
QCD.orderDefinitionWizardContext.order.technology = null;
QCD.orderDefinitionWizardContext.order.description = null;
QCD.orderDefinitionWizardContext.order.productionLine = null;
QCD.orderDefinitionWizardContext.order.materials = [];
QCD.orderDefinitionWizardContext.order.currentMaterialIndex = null;
QCD.orderDefinitionWizardContext.order.lastMaterialIndex = null;
QCD.orderDefinitionWizardContext.order.productEvents = [];


QCD.orderDefinitionWizard = (function() {

    function init() {

        cleanContext();

        $("#selectProduct").prop('disabled', true);
        $("#selectTechnology").prop('disabled', true);

        $("#technology").prop('disabled', true);
        $("#getTechnology").prop('disabled', true);

        $('#products').on('check.bs.table', function(row, $element) {
            $("#selectProduct").prop('disabled', false);
        });
        $('#products').on('uncheck.bs.table', function(row, $element) {
            $("#selectProduct").prop('disabled', true);
        });

        $('#technologies').on('check.bs.table', function(row, $element) {
            $("#selectTechnology").prop('disabled', false);
        });
        $('#technologies').on('uncheck.bs.table', function(row, $element) {
            $("#selectTechnology").prop('disabled', true);
        });

        QCD.orderDefinitionWizardContext.orderDefinitionWizardBody = $('#orderDefinitionWizard').clone();

        $("#orderDefinitionWizard").on('hidden.bs.modal', function() {
            $('#orderDefinitionWizard').remove();
            var myClone = QCD.orderDefinitionWizardContext.orderDefinitionWizardBody.clone();
            $('body').append(myClone);
        });

        $("#orderDefinitionWizard").modal();
        var form = $("#orderDefinitionForm");

        form.steps({
            headerTag: "h3",
            bodyTag: "fieldset",
            transitionEffect: "fade",
            labels: {
                previous: QCD.translate('basic.dashboard.orderDefinitionWizard.previous'),
                next: QCD.translate('basic.dashboard.orderDefinitionWizard.next'),
                finish: QCD.translate('basic.dashboard.orderDefinitionWizard.finish'),
                current: ''
            },
            titleTemplate: '<div class="title"><span class="number">#index#</span>#title#</div>',
            onStepChanging: function(event, currentIndex, newIndex) {
                if (currentIndex == 0) {
                    var invalid = false;
                    if ($("#product").val() == null || $("#product").val() === '' || QCD.orderDefinitionWizardContext.order.product == null) {
                        $("#product").addClass('is-invalid');
                        invalid = true;

                    } else {
                        $("#product").removeClass('is-invalid');
                    }

                    if ($("#quantity").val() == null || $("#quantity").val() === '') {
                        $("#quantity").addClass('is-invalid');
                        invalid = true;
                    } else {
                        $("#quantity").removeClass('is-invalid');
                        invalid = !validQuantity("quantity");
                        if (invalid) {
                            return !invalid;
                        }
                    }


                } else if (currentIndex == 1) {
                    var invalid = false;
                    if ($("#productionLine").val() == null || $("#productionLine").val() === '' || QCD.orderDefinitionWizardContext.order.productionLine == null) {
                        $("#productionLine").addClass('is-invalid');
                        invalid = true;

                    } else {
                        $("#productionLine").removeClass('is-invalid');
                    }

                    if ($("#startDate").val() == null || $("#startDate").val() === '') {
                        $("#startDate").addClass('is-invalid');
                        invalid = true;
                    } else {
                        $("#startDate").removeClass('is-invalid');

                    }
                    if ($("#finishDate").val() == null || $("#finishDate").val() === '') {
                        $("#finishDate").addClass('is-invalid');
                        invalid = true;
                    } else {
                        $("#finishDate").removeClass('is-invalid');

                    }
                } else if (currentIndex == 2) {
                    var materials = QCD.orderDefinitionWizardContext.order.materials;
                    $.each(materials, function(i, material) {
                        if(!material.productInId) {
                        if (material.product == null || material.product === '' || material.productId == null) {
                            $('#product-' + material.index).addClass('is-invalid');
                            invalid = true;

                        } else {
                            $('#product-' + material.index).removeClass('is-invalid');
                        }

                        if (material.quantity == null || material.quantity === '') {
                            $('#quantity-' + material.index).addClass('is-invalid');
                            invalid = true;

                        } else {
                            $('#quantity-' + material.index).removeClass('is-invalid');
                            invalid = !validQuantity("quantity-" + material.index);
                            if (invalid) {
                                return !invalid;
                            }
                        }

                        if (material.quantityPerUnit == null || material.quantityPerUnit === '') {
                            $('#quantityPerUnit-' + material.index).addClass('is-invalid');
                            invalid = true;

                        } else {
                            $('#quantityPerUnit-' + material.index).removeClass('is-invalid');
                            invalid = !validQuantity("quantityPerUnit-" + material.index);
                            if (invalid) {
                                return !invalid;
                            }
                        }
                        }

                    });
                    if(materials.length < 1) {
                    showMessage(
                                            'failure',
                                            QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                                            QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError.materialsNotDefined"),
                                            false);
                                                                        invalid = true;

                    }
                } else if (currentIndex == 3) {
                }
                if (invalid) {
                    showMessage(
                        'failure',
                        QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                        QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError.emptyField"),
                        false);
                } else {
                    preparePreview();
                }
                return !invalid;
            },
            onFinishing: function(event, currentIndex) {
                return true;
            },
            onFinished: function(event, currentIndex) {
                createOrder();
            },
            onInit: function(event, currentIndex) {
                $(".actions").find(".cancelBtn").remove();

                var saveA = $("<a>").attr("href", "#").addClass("cancelBtn").text(QCD.translate('basic.dashboard.orderDefinitionWizard.cancel'));
                var saveBtn = $("<li>").attr("aria-disabled", false).append(saveA);

                $(document).find(".actions ul").prepend(saveBtn)
            },
        });


        $("#getProduct").click(function() {

            $("#productsLookup").appendTo("body").one('shown.bs.modal', function() {
                $("#products").bootstrapTable('destroy');
                $("#orderDefinitionWizard").addClass('disableModal');
                fillProducts();
            }).modal('show');


        });
        $('#productsLookup').on('hidden.bs.modal', function() {
            $("#orderDefinitionWizard").removeClass('disableModal');
        });
        $("#startDate").datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            useStrict: true,
            useCurrent: false,
            locale: QCD.currentLang
        });

        $("#finishDate").datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            useStrict: true,
            useCurrent: false,
            locale: QCD.currentLang
        });

        $("#startDatePicker").click(function() {
            $("#startDate").data("DateTimePicker").toggle();


        });

        $("#finishDatePicker").click(function() {
            $("#finishDate").data("DateTimePicker").toggle();
        });

        $("#selectProduct").click(function() {
            var selectedProducts = $("#products").bootstrapTable('getSelections');
            QCD.orderDefinitionWizardContext.order.product = selectedProducts[0];
            $("#productsLookup").modal('hide');
            $("#product").val(QCD.orderDefinitionWizardContext.order.product.number);
            $("#unit").val(QCD.orderDefinitionWizardContext.order.product.unit);
            $("#technology").prop('disabled', false);
            $("#getTechnology").prop('disabled', false);

        });

        $(".cancelBtn").click(function() {
            $('#orderDefinitionWizard').modal('hide');
        });


        $('#technology').typeahead({
            minLength: 3,
            source: function(query, process) {
                return $.getJSON(
                    'rest/technologies', {
                        query: $("#technology").val(),
                        productId: QCD.orderDefinitionWizardContext.order.product.id
                    },
                    function(data) {
                        var resultList = data.technologies.map(function(item) {
                            var aItem = {
                                id: item.id,
                                name: item.number,
                                number: item.number
                            };
                            return aItem;
                        });
                        return process(resultList);
                    });
            }

        });
        $('#technology').change(function() {
            var current = $('#technology').typeahead("getActive");
            if (current) {
                QCD.orderDefinitionWizardContext.technology = current;
                fillMaterialsForTechnology();
            }

        });

        $('#technology').keyup(function() {
            $('#technology').removeData("active");
            QCD.orderDefinitionWizardContext.order.technology = null;
        });

        $("#getTechnology").click(function() {

            $("#technologiesLookup").appendTo("body").one('shown.bs.modal', function() {
                $("#technologies").bootstrapTable('destroy');
                $("#orderDefinitionWizard").addClass('disableModal');

                fillTechnologies();
            }).modal('show');


        });
        $('#technologiesLookup').on('hidden.bs.modal', function() {
            $("#orderDefinitionWizard").removeClass('disableModal');
        });

        function fillTechnologies() {

            var $technologiesEntries = $("#technologies")
                .bootstrapTable({
                    url: 'rest/technologiesByPage',
                    queryParams: function(p) {
                        return {
                            limit: p.limit,
                            offset: p.offset,
                            sort: p.sort,
                            order: p.order,
                            search: p.search,
                            productId: QCD.orderDefinitionWizardContext.order.product.id

                        };
                    },
                    uniqueId: 'id',
                    undefinedText: '',
                    sidePagination: 'server',
                    search: true,
                    showColumns: true,
                    pagination: true,
                    clickToSelect: true,
                    singleSelect: true,
                    maintainSelected: true,
                    showFooter: false,
                    height: 600,
                    locale: (QCD.currentLang + '-' + QCD.currentLang
                        .toUpperCase())
                });

        }

        $("#selectTechnology").click(function() {
            var selectedTechnology = $("#technologies").bootstrapTable('getSelections');
            QCD.orderDefinitionWizardContext.order.technology = selectedTechnology[0];
            fillMaterialsForTechnology();
            $("#technologiesLookup").modal('hide');
            $("#technology").val(QCD.orderDefinitionWizardContext.order.technology.number);
        });

        $('#product').typeahead({
            minLength: 3,
            source: function(query, process) {
                return $.getJSON(
                    'rest/products', {
                        query: $("#product").val()
                    },
                    function(data) {
                        var resultList = data.entities.map(function(item) {
                            var aItem = {
                                id: item.id,
                                name: item.code,
                                number: item.code,
                                unit: item.unit
                            };
                            return aItem;
                        });
                        return process(resultList);
                    });
            }

        });


        $('#product').change(function() {
            var current = $('#product').typeahead("getActive");
            if (current) {
                QCD.orderDefinitionWizardContext.order.product = current;
                $("#unit").val(QCD.orderDefinitionWizardContext.order.product.unit);
                $("#technology").prop('disabled', false);
                $("#getTechnology").prop('disabled', false);
            }

        });
        $('#product').keyup(function() {
            $('#product').removeData("active");
            QCD.orderDefinitionWizardContext.order.product = null;
            $("#unit").val("");
            $("#technology").prop('disabled', true);
            $("#getTechnology").prop('disabled', true);
        });

        $("#addProduct").click(function() {
            units();
            $("#productNumber").removeClass('is-invalid');
            $("#productName").removeClass('is-invalid');
            $("#productUnit").removeClass('is-invalid');
            $("#productNumber").val(null);
            $("#productName").val(null);
            $("#productUnit").val(null);
            QCD.orderDefinitionWizardContext.order.currentMaterialIndex = null;
            $('#productDefinitionModal').appendTo("body").modal('show');
            $("#orderDefinitionWizard").addClass('disableModal');
        });

        $('#productDefinitionModal').on('hidden.bs.modal', function() {
            $("#orderDefinitionWizard").removeClass('disableModal');
        });


        function validQuantity(field) {
            var valid = true;

            var value = $("#" + field).val();
            value = evaluateExpression(value);

            $("#" + field).val(value);

            if ((value != null) && (value != '') &&
                isNaN(value)) {
                valid = false;
            }

            if (valid && (value < 1)) {
                valid = false;
            }

            var validationResult;

            if ((value != null) && (value != '') && valid) {
                validationResult = validateDecimal(value);

                if (!validationResult.validPrecision ||
                    !validationResult.validScale) {
                    valid = false;
                }
            }

            if (!valid) {
                isValid = false;

                if ((typeof validationResult !== "undefined") &&
                    !validationResult.validPrecision) {
                    showMessage(
                        'failure',
                        QCD
                        .translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                        QCD
                        .translate("basic.dashboard.orderDefinitionWizard.error.validationError.wrongDecimalPrecision"),
                        false);
                } else if ((typeof validationResult !== "undefined") &&
                    !validationResult.validScale) {
                    showMessage(
                        'failure',
                        QCD
                        .translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                        QCD
                        .translate("basic.dashboard.orderDefinitionWizard.error.validationError.wrongDecimalScale"),
                        false);
                }

                $("#" + field).addClass('is-invalid');
            } else {
                $("#" + field).removeClass('is-invalid');
            }
            return valid;
        }

        $("#saveProduct").click(function() {
            var invalid = false;
            $("#productNumber").removeClass('is-invalid');
            $("#productName").removeClass('is-invalid');
            $("#productUnit").removeClass('is-invalid');

            if ($("#productNumber").val() == null || $("#productNumber").val() === '') {
                $("#productNumber").addClass('is-invalid');
                invalid = true;

            }

            if ($("#productName").val() == null || $("#productName").val() === '') {
                $("#productName").addClass('is-invalid');
                invalid = true;

            }

            if ($("#productUnit").val() == null || $("#productUnit").val() === '') {
                $("#productUnit").addClass('is-invalid');
                invalid = true;

            }
            if (invalid) {
                showMessage(
                    'failure',
                    QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                    QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError.emptyField"),
                    false);
                return;
            }

            var product = {};
            product.number = $("#productNumber").val();
            product.name = $("#productName").val();
            product.unit = $("#productUnit").val();
            $.ajax({
                url: "rest/product",
                type: "POST",
                data: JSON.stringify(product),
                contentType: "application/json",
                beforeSend: function() {
                    $("#loader").appendTo("body").modal('show');
                },
                success: function(data) {
                    if (!QCD.orderDefinitionWizardContext.order.lastMaterialIndex) {
                        if (data.code === 'OK') {
                            QCD.orderDefinitionWizardContext.order.product = {};
                            QCD.orderDefinitionWizardContext.order.product.id = data.id;
                            QCD.orderDefinitionWizardContext.order.product.number = data.number;
                            QCD.orderDefinitionWizardContext.order.product.name = data.name;
                            QCD.orderDefinitionWizardContext.order.product.unit = data.unit;
                            $("#productDefinitionModal").modal('hide');
                            $("#product").val(QCD.orderDefinitionWizardContext.order.product.number);
                            $("#unit").val(QCD.orderDefinitionWizardContext.order.product.unit);
                        } else {
                            showMessage(
                                'failure',
                                QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                                data.message,
                                false);
                        }
                    } else {
                        if (data.code === 'OK') {
                            $("#productDefinitionModal").modal('hide');
                            var materials = QCD.orderDefinitionWizardContext.order.materials;
                            $.each(materials, function(i, e) {
                                if (e.index == QCD.orderDefinitionWizardContext.order.lastMaterialIndex) {
                                    e.productId = data.id;
                                    e.productNumber = data.number;
                                    e.product = data.number;
                                    e.unit = data.unit;
                                    $('#product-' + QCD.orderDefinitionWizardContext.order.lastMaterialIndex).val(data.number);
                                    $('#unit-' + QCD.orderDefinitionWizardContext.order.lastMaterialIndex).val(data.unit);
                                }
                            });
                        } else {
                            showMessage(
                                'failure',
                                QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                                data.message,
                                false);
                        }
                    }
                                        $("#loader").modal('hide');

                },
                error: function(data) {
                    QCD.terminalView.showMessage('failure', QCD
                        .translate(failureMessage), QCD
                        .translate(data.message), false);

                },
                complete: function() {
                    $("#loader").modal('hide');
                }
            });


        });


        // step 2
        $('#productionLine').typeahead({
            minLength: 3,
            source: function(query, process) {
                return $.getJSON(
                    'rest/productionLines', {
                        query: $("#productionLine").val()
                    },
                    function(data) {
                        var resultList = data.productionLines.map(function(item) {
                            var aItem = {
                                id: item.id,
                                name: item.name,
                                number: item.number
                            };
                            return aItem;
                        });
                        return process(resultList);
                    });
            }

        });
        $('#productionLine').change(function() {
            var current = $('#productionLine').typeahead("getActive");
            if (current) {
                QCD.orderDefinitionWizardContext.order.productionLine = current;
            }

        });

        $('#productionLine').keyup(function() {
            $('#productionLine').removeData("active");
            QCD.orderDefinitionWizardContext.order.productionLine = null;
        });

        $("#getProductionLine").click(function() {

            $("#productionLinesLookup").one('shown.bs.modal', function() {
                $("#productionLines").bootstrapTable('destroy');
                fillProductionLines();
            }).appendTo("body").modal('show');


        });
        $('#productionLinesLookup').on('hidden.bs.modal', function() {
            $("#orderDefinitionWizard").removeClass('disableModal');
        });

        function fillProductionLines() {

            var $productionLinesEntries = $("#productionLines")
                .bootstrapTable({
                    url: 'rest/productionLinesByPage',
                    queryParams: function(p) {
                        return {
                            limit: p.limit,
                            offset: p.offset,
                            sort: p.sort,
                            order: p.order,
                            search: p.search

                        };
                    },
                    uniqueId: 'id',
                    undefinedText: '',
                    sidePagination: 'server',
                    search: true,
                    showColumns: true,
                    pagination: true,
                    clickToSelect: true,
                    singleSelect: true,
                    maintainSelected: true,
                    showFooter: false,
                    height: 600,
                    locale: (QCD.currentLang + '-' + QCD.currentLang
                        .toUpperCase())
                });

        }

        $("#selectProductionLine").click(function() {
            var selectedProductionLines = $("#productionLines").bootstrapTable('getSelections');
            QCD.orderDefinitionWizardContext.order.productionLine = selectedProductionLines[0];
            $("#productionLinesLookup").modal('hide');
            $("#productionLine").val(QCD.orderDefinitionWizardContext.order.productionLine.number);
        });

        $("#addProductionLine").click(function() {

            $("#productionLineDefinitionModal").one('shown.bs.modal', function() {
                $("#productionLineNumber").val("");
                $("#productionLineName").val("");
                $("#orderDefinitionWizard").addClass('disableModal');

            }).appendTo("body").modal('show');


        });

        $('#productionLineDefinitionModal').on('hidden.bs.modal', function() {
            $("#orderDefinitionWizard").removeClass('disableModal');
        });
        $("#saveProductionLine").click(function() {
            var invalid = false;
            $("#productionLineNumber").removeClass('is-invalid');
            $("#productionLineName").removeClass('is-invalid');

            if ($("#productionLineNumber").val() == null || $("#productionLineNumber").val() === '') {
                $("#productionLineNumber").addClass('is-invalid');
                invalid = true;

            }

            if ($("#productionLineName").val() == null || $("#productionLineName").val() === '') {
                $("#productionLineName").addClass('is-invalid');
                invalid = true;

            }

            if (invalid) {
                showMessage(
                    'failure',
                    QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                    QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError.emptyField"),
                    false);
                return;
            }

            var productionLine = {};
            productionLine.number = $("#productionLineNumber").val();
            productionLine.name = $("#productionLineName").val();

            $.ajax({
                url: "rest/productionLine",
                type: "POST",
                data: JSON.stringify(productionLine),
                contentType: "application/json",
                beforeSend: function() {
                    $("#loader").appendTo("body").modal('show');
                },
                success: function(data) {
                    if (data.code === 'OK') {
                        QCD.orderDefinitionWizardContext.order.productionLine = {};
                        QCD.orderDefinitionWizardContext.order.productionLine.id = data.id;
                        QCD.orderDefinitionWizardContext.order.productionLine.number = data.number;
                        QCD.orderDefinitionWizardContext.order.productionLine.name = data.name;
                        $("#productionLineDefinitionModal").modal('hide');
                        $("#productionLine").val(QCD.orderDefinitionWizardContext.order.productionLine.number);

                    } else {
                        showMessage(
                            'failure',
                            QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                            data.message,
                            false);
                    }
                },
                error: function(data) {
                    QCD.terminalView.showMessage('failure', QCD
                        .translate(failureMessage), QCD
                        .translate(data.message), false);

                },
                complete: function() {
                    $("#loader").modal('hide');
                }
            });


        });
        //step 3
        $("#removeMaterial").prop('disabled', true);

        $('#materials').on('check.bs.table', function(row, $element) {
            $("#removeMaterial").prop('disabled', false);
            QCD.orderDefinitionWizardContext.order.lastMaterialIndex = $element.index;

        });
        $('#materials').on('uncheck.bs.table', function(row, $element) {
            $("#removeMaterial").prop('disabled', true);
        });


        var $materialsTable = $("#materials")
            .bootstrapTable({
                uniqueId: 'index',
                search: false,
                undefinedText: '',
                showColumns: false,
                pagination: false,
                clickToSelect: true,
                singleSelect: true,
                maintainSelected: true,
                sortName: 'index',
                sortOrder: 'desc',
                showFooter: false,
                height: 350,
                locale: (QCD.currentLang + '-' + QCD.currentLang
                    .toUpperCase())
            });

        var $prev_materialsTable = $("#prev_materials")
            .bootstrapTable({
                uniqueId: 'index',
                search: true,
                undefinedText: '',
                showColumns: false,
                pagination: false,
                clickToSelect: false,
                singleSelect: false,
                maintainSelected: false,
                showFooter: false,
                height: 350,
                locale: (QCD.currentLang + '-' + QCD.currentLang
                    .toUpperCase())
            });

        $("#removeMaterial").click(function() {
            var ids = $.map($("#materials").bootstrapTable('getSelections'), function(row) {
                return row.index
            })
            $("#materials").bootstrapTable('remove', {
                field: 'index',
                values: ids
            })
        });

        $("#newMaterial").click(function() {
            var material = {};
            material.productInId = null;
            material.productId = null;
            material.product = "";
            material.productNumber = "";
            material.quantity = "";
            material.quantityPerUnit = "";
            material.unit = "";
            material.index = new Date().getTime();
            QCD.orderDefinitionWizardContext.order.materials.push(material);
            $materialsTable.bootstrapTable('load', QCD.orderDefinitionWizardContext.order.materials);
        });

        $('[data-toggle="tooltip"]').tooltip();

    }

    function quantityPerUnitOnBlur(element) {
        var data = QCD.orderDefinitionWizardContext.order.materials;
        $.each(data, function(i, e) {
            if (e.index == element) {
                e.quantityPerUnit = $('#quantityPerUnit-' + element).val();
            }
        });
    }

    function quantityOnBlur(element) {
        var data = QCD.orderDefinitionWizardContext.order.materials;
        $.each(data, function(i, e) {
            if (e.index == element) {
                e.quantity = $('#quantity-' + element).val();
            }
        });
    }


    function addProductTypeahead(element) {
        if (!QCD.orderDefinitionWizardContext.order.productEvents.includes(element)) {
            $('#product-' + element).typeahead({
                minLength: 3,
                source: function(query, process) {
                    return $.getJSON(
                        'rest/products', {
                            query: $('#product-' + element).val()
                        },
                        function(data) {
                            var resultList = data.entities.map(function(item) {
                                var aItem = {
                                    id: item.id,
                                    name: item.code,
                                    number: item.code,
                                    unit: item.unit
                                };
                                return aItem;
                            });
                            return process(resultList);
                        });
                }

            });

            $('#product-' + element).change(function() {
                var current = $('#product-' + element).typeahead("getActive");
                if (current) {
                    var data = QCD.orderDefinitionWizardContext.order.materials;
                    $.each(data, function(i, e) {
                        if (e.index == QCD.orderDefinitionWizardContext.order.lastMaterialIndex) {
                            e.productId = current.id;
                            e.productNumber = current.number;
                            e.product = current.number;
                            e.unit = current.unit;
                            $('#unit-' + QCD.orderDefinitionWizardContext.order.lastMaterialIndex).val(current.unit);

                        }
                    });
                } else {
                    $('#product-' + element).val("");
                }
            });

            $('#product-' + element).keyup(function() {
                $('#product-' + element).removeData("active");
                var data = QCD.orderDefinitionWizardContext.order.materials;
                $.each(data, function(i, e) {
                    if (e.index == QCD.orderDefinitionWizardContext.order.lastMaterialIndex) {
                        e.productId = null;
                        e.productNumber = null;
                        e.product = "";
                        e.unit = null;

                        $('#unit-' + QCD.orderDefinitionWizardContext.order.lastMaterialIndex).val("");

                    }
                });
            });
            QCD.orderDefinitionWizardContext.order.productEvents.push(element);
        }
    }

    function selectMaterialsItem() {
        var selectedMaterials = $("#materialsItem").bootstrapTable('getSelections');
        $("#materialsLookup").modal('hide');
        $('#product-' + QCD.orderDefinitionWizardContext.order.currentMaterialIndex).val(selectedMaterials[0].number);
        var data = QCD.orderDefinitionWizardContext.order.materials;
        $.each(data, function(i, e) {
            if (e.index == QCD.orderDefinitionWizardContext.order.currentMaterialIndex) {
                e.productId = selectedMaterials[0].id;
                e.productNumber = selectedMaterials[0].number;
                e.product = selectedMaterials[0].number;
                e.unit = selectedMaterials[0].unit;
                $('#unit-' + QCD.orderDefinitionWizardContext.order.currentMaterialIndex).val(selectedMaterials[0].unit);

            }
        });
    }



    function openMaterialsLookup(element) {
        $("#materialsLookup").appendTo("body").one('shown.bs.modal', function() {
            QCD.orderDefinitionWizardContext.order.currentMaterialIndex = element;
            $("#materialsItem").bootstrapTable('destroy');
            $("#orderDefinitionWizard").addClass('disableModal');

            fillMaterials();
        }).modal('show');
    }
    $('#materialsLookup').on('hidden.bs.modal', function() {
        $("#orderDefinitionWizard").removeClass('disableModal');
    });

    function fillMaterials() {
        var $productsEntries = $("#materialsItem")
            .bootstrapTable({
                url: 'rest/productsByPage',
                queryParams: function(p) {
                    return {
                        limit: p.limit,
                        offset: p.offset,
                        sort: p.sort,
                        order: p.order,
                        search: p.search

                    };
                },
                uniqueId: 'id',
                undefinedText: '',
                sidePagination: 'server',
                search: true,
                showColumns: true,
                pagination: true,
                clickToSelect: true,
                singleSelect: true,
                maintainSelected: true,
                showFooter: false,
                height: 600,
                locale: (QCD.currentLang + '-' + QCD.currentLang
                    .toUpperCase())
            });


    }

    function units() {
        $.ajax({
            url: "rest/units",
            type: "GET",
            async: false,
            beforeSend: function(data) {
                				$("#loader").appendTo("body").modal('show');

            },
            success: function(data) {
                $("#productUnit").empty();

                $("#productUnit").append('<option value=""></option>');
                for (const [key, value] of Object.entries(data)) {


                    $("#productUnit").append(
                        '<option value="' + value.key + '">' + value.key +
                        '</option>');


                }

            },
            error: function(data) {
                QCD.terminalView.showMessage('failure', QCD
                    .translate(failureMessage),
                    QCD.translate(data.message), false);
            },
            complete: function() {
                $("#loader").modal('hide');
            }
        });
    }

    function fillProducts() {
        var $productsEntries = $("#products")
            .bootstrapTable({
                url: 'rest/productsByPage',
                queryParams: function(p) {
                    return {
                        limit: p.limit,
                        offset: p.offset,
                        sort: p.sort,
                        order: p.order,
                        search: p.search

                    };
                },
                uniqueId: 'id',
                undefinedText: '',
                sidePagination: 'server',
                search: true,
                showColumns: true,
                pagination: true,
                clickToSelect: true,
                singleSelect: true,
                maintainSelected: true,
                showFooter: false,
                height: 600,
                locale: (QCD.currentLang + '-' + QCD.currentLang
                    .toUpperCase())
            });
    }

    function openMaterialDefinition(index) {
        QCD.orderDefinitionWizardContext.order.lastMaterialIndex = index;
        units();
        $("#productNumber").removeClass('is-invalid');
        $("#productName").removeClass('is-invalid');
        $("#productUnit").removeClass('is-invalid');
        $("#productNumber").val(null);
        $("#productName").val(null);
        $("#productUnit").val(null);
        $("#orderDefinitionWizard").addClass('disableModal');

        $('#productDefinitionModal').appendTo("body").modal('show');

    }

    function preparePreview() {
        $("#prev_product").val($("#product").val());
        $("#prev_quantity").val($("#quantity").val());
        $("#prev_unit").val($("#unit").val());
        $("#prev_description").val($("#description").val());
        $("#prev_technology").val($("#technology").val());
        $("#prev_productionLine").val($("#productionLine").val());
        $("#prev_startDate").val($("#startDate").val());
        $("#prev_finishDate").val($("#finishDate").val());
        $("#prev_materials").bootstrapTable('load', QCD.orderDefinitionWizardContext.order.materials);
    }

    function createOrder() {
        var order = {};
        order.productId = QCD.orderDefinitionWizardContext.order.product.id;
        order.quantity = $("#quantity").val();
        order.description = $("#description").val();
        if (QCD.orderDefinitionWizardContext.order.technology) {
            order.technologyId = QCD.orderDefinitionWizardContext.order.technology.id;
        }
        order.productionLineId = QCD.orderDefinitionWizardContext.order.productionLine.id;
        order.startDate = getDate("startDate");
        order.finishDate = getDate("finishDate");
        order.materials = [];
        var materials = QCD.orderDefinitionWizardContext.order.materials;
        $.each(materials, function(i, material) {
            var usedMaterial = {};
            usedMaterial.productId = material.productId;
            usedMaterial.quantity = material.quantity;
            usedMaterial.quantityPerUnit = material.quantityPerUnit;
            order.materials.push(usedMaterial);
        });
        $.ajax({
            url: "rest/order",
            type: "POST",
            data: JSON.stringify(order),
            contentType: "application/json",
            beforeSend: function() {
                $("#loader").appendTo("body").modal('show');
            },
            success: function(data) {
                if (data.code === 'OK') {

                    $("#orderDefinitionWizard").modal('hide');
                    location.reload();
                } else {
                    showMessage(
                        'failure',
                        QCD.translate("basic.dashboard.orderDefinitionWizard.error.validationError"),
                        data.message,
                        false);
                }

            },
            error: function(data) {
                QCD.terminalView.showMessage('failure', QCD
                    .translate(failureMessage), QCD
                    .translate(data.message), false);

            },
            complete: function() {
                $("#loader").modal('hide');
            }
        });
    }

    function getDate(element) {
        var date = $("#" + element).val();

        if (date == null ||
            date == '') {
            return null;
        } else {
            return moment(date, 'YYYY-MM-DD HH:mm:ss')
                .toDate();
        }
    }
    function fillMaterialsForTechnology(element) {
         $.ajax({
                    url: "rest/technology/"+QCD.orderDefinitionWizardContext.order.technology.id+"/materials",
                    type: "GET",
                    async: false,
                    beforeSend: function(data) {
                        $("#loader").appendTo("body").modal('show');
                    },
                    success: function(data) {
                      QCD.orderDefinitionWizardContext.order.materials = data;
                      $("#materials").bootstrapTable('load', QCD.orderDefinitionWizardContext.order.materials);

                    },
                    error: function(data) {
                        QCD.terminalView.showMessage('failure', QCD
                            .translate(failureMessage),
                            QCD.translate(data.message), false);
                    },
                    complete: function() {
                        $("#loader").modal('hide');
                    }
                });
    }

    function cleanContext() {
        QCD.orderDefinitionWizardContext.order = {};
        QCD.orderDefinitionWizardContext.order.product = null;
        QCD.orderDefinitionWizardContext.order.technology = null;
        QCD.orderDefinitionWizardContext.order.description = null;
        QCD.orderDefinitionWizardContext.order.productionLine = null;
        QCD.orderDefinitionWizardContext.order.materials = [];
        QCD.orderDefinitionWizardContext.order.currentMaterialIndex = null;
        QCD.orderDefinitionWizardContext.order.lastMaterialIndex = null;
        QCD.orderDefinitionWizardContext.order.productEvents = [];
    }

    return {
        init: init,
        addProductTypeahead: addProductTypeahead,
        openMaterialsLookup: openMaterialsLookup,
        openMaterialDefinition: openMaterialDefinition,
        selectMaterialsItem: selectMaterialsItem,
        quantityPerUnitOnBlur: quantityPerUnitOnBlur,
        quantityOnBlur: quantityOnBlur
    };

})();

function evaluateExpression(s) {
    if (s == '') {
        return s;
    }
    s = s.replace(/,/g, '.');

    var total = 0,
        s = s.match(/[+]*(\.\d+|\d+(\.\d+)?)/g) || [];
    while (s.length) {
        total += parseFloat(s.shift());
    }
    sTotal = '' + total;
    return sTotal;
}

var defaultPrecision = 14;
var defaultScale = 5;

function validateDecimal(value) {
    return validateDecimalWithPrecisionAndScale(value, defaultPrecision, defaultScale);
}

function validateDecimalWithPrecisionAndScale(value, precision, scale) {

    var validPrecision = true;
    var validScale = true;
    var isScale = false;
    var parts;

    if (value.toString().indexOf('.') > 0) {
        parts = value.toString().split('.');
        isScale = true;
    } else if (value.toString().indexOf(',') > 0) {
        parts = value.toString().split(',');
        isScale = true;
    }


    if (isScale && parts[1].length > scale) {
        validScale = false;
    }

    var cleanValueLength = value.toString().length;
    if (isScale) {
        cleanValueLength = cleanValueLength - 1 - parts[1].length;
    }

    if (cleanValueLength > (precision - scale)) {
        validPrecision = false;
    }

    return {
        validPrecision: validPrecision,
        validScale: validScale
    };

}

function productFormatter(value, row) {
     if(row.productInId) {
    return '<div class="input-group">' +
        '<input type="text" disabled class="form-control q-auto-complete" tabindex="1"  onkeypress="QCD.orderDefinitionWizard.addProductTypeahead(' + new String(row.index) + ')" id="product-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
        '<div class="input-group-append">' +
        '<button type="button" disabled class="btn btn-outline-secondary bg-primary text-white" onclick="QCD.orderDefinitionWizard.openMaterialsLookup(' + new String(row.index) + ')">' +
        '<span class="glyphicon glyphicon-search"></span>' +
        '</button>' +
        '</div>' +
        '<div class="input-group-append">' +
        '<button type="button" disabled class="btn btn-outline-secondary bg-primary text-white" onclick="QCD.orderDefinitionWizard.openMaterialDefinition(' + new String(row.index) + ')">' +
        '<span class="glyphicon glyphicon-plus"></span>' +
        '</button>' +
        '</div>' +
        '</div>';
 } else {
     return '<div class="input-group">' +
         '<input type="text" class="form-control q-auto-complete" tabindex="1"  onkeypress="QCD.orderDefinitionWizard.addProductTypeahead(' + new String(row.index) + ')" id="product-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
         '<div class="input-group-append">' +
         '<button type="button" class="btn btn-outline-secondary bg-primary text-white" onclick="QCD.orderDefinitionWizard.openMaterialsLookup(' + new String(row.index) + ')">' +
         '<span class="glyphicon glyphicon-search"></span>' +
         '</button>' +
         '</div>' +
         '<div class="input-group-append">' +
         '<button type="button" class="btn btn-outline-secondary bg-primary text-white" onclick="QCD.orderDefinitionWizard.openMaterialDefinition(' + new String(row.index) + ')">' +
         '<span class="glyphicon glyphicon-plus"></span>' +
         '</button>' +
         '</div>' +
         '</div>';
 }


}

function quantityFormatter(value, row) {
     if(row.productInId) {
    return '<div class="input-group">' +
        '<input type="text" disabled class="form-control right " tabindex="1" onblur="QCD.orderDefinitionWizard.quantityOnBlur(' + new String(row.index) + ')" id="quantity-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
        '</div>';
} else {
    return '<div class="input-group">' +
        '<input type="text" class="form-control right " tabindex="1" onblur="QCD.orderDefinitionWizard.quantityOnBlur(' + new String(row.index) + ')" id="quantity-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
        '</div>';
}

}

function quantityPerUnitFormatter(value, row) {
     if(row.productInId) {
        return '<div class="input-group">' +
                  '<input type="text" disabled class="form-control right " tabindex="1" onblur="QCD.orderDefinitionWizard.quantityPerUnitOnBlur(' + new String(row.index) + ')" id="quantityPerUnit-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
                  '</div>';
     } else {
        return '<div class="input-group">' +
             '<input type="text" class="form-control right " tabindex="1" onblur="QCD.orderDefinitionWizard.quantityPerUnitOnBlur(' + new String(row.index) + ')" id="quantityPerUnit-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
             '</div>';
     }

}

function unitFormatter(value, row) {
     if(row.productInId) {
    return '<div class="input-group">' +
        '<input type="text" disabled class="form-control" disabled tabindex="1" id="unit-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
        '</div>';
} else {
    return '<div class="input-group">' +
        '<input type="text" class="form-control" disabled tabindex="1" id="unit-' + row.index + '" value="' + nullToEmptyValue(value) + '"/>' +
        '</div>';
}

}


function nullToEmptyValue(value) {
    if (value) {
        return value;
    } else {
        return "";
    }
}
