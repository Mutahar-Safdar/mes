package com.qcadoo.mes.productionLines.controller;

import com.qcadoo.localization.api.TranslationService;
import com.qcadoo.mes.productionLines.constants.ProductionLineFields;
import com.qcadoo.mes.productionLines.constants.ProductionLinesConstants;
import com.qcadoo.mes.productionLines.controller.dataProvider.ProductionLineRequest;
import com.qcadoo.mes.productionLines.controller.dataProvider.ProductionLineResponse;
import com.qcadoo.mes.productionLines.controller.dataProvider.ProductionLinesDataProvider;
import com.qcadoo.mes.productionLines.controller.dataProvider.ProductionLinesGridResponse;
import com.qcadoo.mes.productionLines.controller.dataProvider.ProductionLinesResponse;
import com.qcadoo.model.api.DataDefinitionService;
import com.qcadoo.model.api.Entity;
import com.qcadoo.model.api.validators.ErrorMessage;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public final class ProductionLinesApiController {

    @Autowired
    private ProductionLinesDataProvider dataProvider;

    @Autowired
    private DataDefinitionService dataDefinitionService;

    @Autowired
    private TranslationService translationService;

    @ResponseBody
    @RequestMapping(value = "/productionLines", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProductionLinesResponse getTechnologies(@RequestParam("query") String query) {
        return dataProvider.getProductionLines(query);
    }

    @ResponseBody
    @RequestMapping(value = "/productionLinesByPage", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProductionLinesGridResponse getProducts(@RequestParam(value = "limit") int limit, @RequestParam(value = "offset") int offset,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "order", required = false) String order,
            @RequestParam(value = "search", required = false) String search) {
        return dataProvider.getTechnologiesResponse(limit, offset, sort, order, search);
    }

    @ResponseBody
    @RequestMapping(value = "/productionLine", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ProductionLineResponse saveProduct(@RequestBody ProductionLineRequest productionLine) {

        Entity productionLineEntity = dataDefinitionService.get(ProductionLinesConstants.PLUGIN_IDENTIFIER, ProductionLinesConstants.MODEL_PRODUCTION_LINE).create();
        productionLineEntity.setField(ProductionLineFields.NUMBER, productionLine.getNumber());
        productionLineEntity.setField(ProductionLineFields.NAME, productionLine.getName());
        productionLineEntity.setField(ProductionLineFields.QUANTITY_FOR_OTHER_WORKSTATION_TYPES, 1);

        productionLineEntity = productionLineEntity.getDataDefinition().save(productionLineEntity);
        if(productionLineEntity.isValid()) {
            ProductionLineResponse productionLineResponse = new ProductionLineResponse(ProductionLineResponse.StatusCode.OK);
            productionLineResponse.setId(productionLineEntity.getId());
            productionLineResponse.setNumber(productionLine.getNumber());
            productionLineResponse.setName(productionLine.getName());
            return productionLineResponse;
        } else {
            //
            ErrorMessage numberError = productionLineEntity.getError(ProductionLineFields.NUMBER);
            if(Objects.nonNull(numberError) && numberError.getMessage().equals("qcadooView.validate.field.error.duplicated")) {
                ProductionLineResponse response = new ProductionLineResponse(ProductionLineResponse.StatusCode.ERROR);
                response.setMessage(translationService.translate("basic.dashboard.orderDefinitionWizard.error.validationError.productionLineDuplicated",
                        LocaleContextHolder.getLocale()));
                return response;
            }

        }
        ProductionLineResponse response = new ProductionLineResponse(ProductionLineResponse.StatusCode.ERROR);
        response.setMessage(translationService.translate("basic.dashboard.orderDefinitionWizard.error.validationError.productionLineErrors",
                LocaleContextHolder.getLocale()));
        return response;
    }
}
