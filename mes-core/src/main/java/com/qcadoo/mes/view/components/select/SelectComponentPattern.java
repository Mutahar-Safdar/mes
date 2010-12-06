package com.qcadoo.mes.view.components.select;

import com.qcadoo.mes.view.ComponentDefinition;
import com.qcadoo.mes.view.ComponentState;
import com.qcadoo.mes.view.ViewComponent;
import com.qcadoo.mes.view.components.FieldComponentPattern;

@ViewComponent("select")
public final class SelectComponentPattern extends FieldComponentPattern {

    private static final String JSP_PATH = "newComponents/select.jsp";

    private static final String JS_OBJECT = "QCD.components.elements.DynamicComboBox";

    public SelectComponentPattern(final ComponentDefinition componentDefinition) {
        super(componentDefinition);
    }

    @Override
    public ComponentState getComponentStateInstance() {
        return new SelectComponentState(getFieldDefinition());
    }

    @Override
    public String getJspFilePath() {
        return JSP_PATH;
    }

    @Override
    public String getJsFilePath() {
        return JS_PATH;
    }

    @Override
    public String getJsObjectName() {
        return JS_OBJECT;
    }
}
