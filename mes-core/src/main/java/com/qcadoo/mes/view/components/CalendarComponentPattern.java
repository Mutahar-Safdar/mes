package com.qcadoo.mes.view.components;

import com.qcadoo.mes.view.ComponentDefinition;
import com.qcadoo.mes.view.ComponentState;
import com.qcadoo.mes.view.ViewComponent;

@ViewComponent("calendar")
public final class CalendarComponentPattern extends FieldComponentPattern {

    private static final String JSP_PATH = "newComponents/calendar.jsp";

    private static final String JS_OBJECT = "QCD.components.elements.Calendar";

    public CalendarComponentPattern(final ComponentDefinition componentDefinition) {
        super(componentDefinition);
    }

    @Override
    public ComponentState getComponentStateInstance() {
        return new FieldComponentState();
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
