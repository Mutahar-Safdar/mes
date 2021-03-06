package com.qcadoo.mes.technologies.controller.dataProvider;

import com.google.common.collect.Maps;
import com.qcadoo.mes.technologies.OperationComponentDataProvider;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DataProviderForTechnology {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    private OperationComponentDataProvider operationComponentDataProvider;

    public TechnologiesResponse getTechnologies(String query, Long productId) {
        StringBuilder queryBuilder = new StringBuilder();
        queryBuilder.append("Select id as id, number as number From technologies_technology ");
        queryBuilder.append("WHERE product_id = :productId AND state = '02accepted' AND number ilike :query LIMIT 10 " );

        Map<String, Object> parameters = Maps.newHashMap();

        String ilikeQuery = "%" + query + "%";
        parameters.put("query", ilikeQuery);
        parameters.put("productId", productId);
        List<TechnologyDto> technologies =  jdbcTemplate.query(queryBuilder.toString(), parameters,
                new BeanPropertyRowMapper(TechnologyDto.class));
        TechnologiesResponse technologiesResponse = new TechnologiesResponse();
        technologiesResponse.setTechnologies(technologies);
        return technologiesResponse;
    }

    public TechnologiesGridResponse getTechnologiesResponse(int limit, int offset, String sort, String order, String search,
            Long productId) {
        StringBuilder query = new StringBuilder();
        query.append("SELECT tech.id, tech.number, tech.name ");
        query.append("FROM technologies_technology tech WHERE tech.active = true AND tech.product_id = :productID AND tech.state = '02accepted' ");

        StringBuilder queryCount = new StringBuilder();
        queryCount.append("SELECT COUNT(*) ");
        queryCount.append("FROM technologies_technology tech WHERE tech.active = true AND tech.product_id = :productID AND tech.state = '02accepted' ");

        appendTechnologyConditions(search, query);
        appendTechnologyConditions(search, queryCount);

        if(StringUtils.isNotEmpty(sort)) {
            query.append(" ORDER BY " + sort + " " + order);
        }
        query.append(String.format(" LIMIT %d OFFSET %d", limit, offset));

        Map<String, Object> parameters = Maps.newHashMap();
        parameters.put("productID", productId);

        Integer countRecords = jdbcTemplate.queryForObject(queryCount.toString(), parameters, Long.class).intValue();

        List<TechnologyDto> products = jdbcTemplate.query(query.toString(), parameters,
                new BeanPropertyRowMapper(TechnologyDto.class));

        return new TechnologiesGridResponse(countRecords, products);
    }

    private void appendTechnologyConditions(String search, StringBuilder query) {
        if(StringUtils.isNotEmpty(search)) {
            query.append(" AND (");
            query.append("UPPER(tech.number) LIKE '%").append(search.toUpperCase()).append("%' OR ");
            query.append("UPPER(tech.name) LIKE '%").append(search.toUpperCase()).append("%' ");
            query.append(") ");
        }
    }

    public List<MaterialDto> getTechnologyMaterials(Long technologyId) {
        List<Long> ids = operationComponentDataProvider.getComponentsForTechnology(technologyId);
        StringBuilder query = new StringBuilder();
        query.append("SELECT opic.id as productInId, opic.id as index, p.id as productId, p.number as product, p.number as productNumber,  ");
        query.append("p.name as productName, p.unit as unit, opic.quantity as quantityPerUnit ");
        query.append("FROM technologies_operationproductincomponent opic ");
        query.append("LEFT JOIN basic_product p ON opic.product_id = p.id ");
        query.append("WHERE opic.id IN (:ids) ");
        Map<String, Object> parameters = Maps.newHashMap();
        parameters.put("ids", ids);
        return  jdbcTemplate.query(query.toString(), parameters,
                new BeanPropertyRowMapper(MaterialDto.class));
    }
}
