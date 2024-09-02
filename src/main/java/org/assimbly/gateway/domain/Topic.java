package org.assimbly.gateway.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import java.io.Serializable;

/**
 * A Topic.
 */
@Entity
@Table(name = "topic")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Topic implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "sequenceGenerator")
    @GenericGenerator(strategy = "enhanced-sequence", name = "sequenceGenerator", parameters = {
        @Parameter(name = "initial_value", value = "1"),
        @Parameter(name = "increment_size", value = "1")})
    @Column(name = "id")
    private Long id;

    @Column(name = "items_on_page")
    private Integer itemsOnPage;

    @Column(name = "refresh_interval")
    private Integer refreshInterval;

    @Column(name = "selected_column")
    private String selectedColumn;

    @Column(name = "order_column")
    private String orderColumn;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getItemsOnPage() {
        return itemsOnPage;
    }

    public Topic itemsOnPage(Integer itemsOnPage) {
        this.itemsOnPage = itemsOnPage;
        return this;
    }

    public void setItemsOnPage(Integer itemsOnPage) {
        this.itemsOnPage = itemsOnPage;
    }

    public Integer getRefreshInterval() {
        return refreshInterval;
    }

    public Topic refreshInterval(Integer refreshInterval) {
        this.refreshInterval = refreshInterval;
        return this;
    }

    public void setRefreshInterval(Integer refreshInterval) {
        this.refreshInterval = refreshInterval;
    }

    public String getSelectedColumn() {
        return selectedColumn;
    }

    public Topic selectedColumn(String selectedColumn) {
        this.selectedColumn = selectedColumn;
        return this;
    }

    public void setSelectedColumn(String selectedColumn) {
        this.selectedColumn = selectedColumn;
    }

    public String getOrderColumn() {
        return orderColumn;
    }

    public Topic orderColumn(String orderColumn) {
        this.orderColumn = orderColumn;
        return this;
    }

    public void setOrderColumn(String orderColumn) {
        this.orderColumn = orderColumn;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Topic)) {
            return false;
        }
        return id != null && id.equals(((Topic) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Topic{" +
            "id=" + getId() +
            ", itemsOnPage=" + getItemsOnPage() +
            ", refreshInterval=" + getRefreshInterval() +
            ", selectedColumn='" + getSelectedColumn() + "'" +
            ", orderColumn='" + getOrderColumn() + "'" +
            "}";
    }
}
