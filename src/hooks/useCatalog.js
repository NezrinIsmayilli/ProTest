import { useState } from 'react';

export const useCatalog = () => {
  const [parentCatalogs, setParentCatalogs] = useState([]);
  const [childCatalogs, setChildCatalogs] = useState([]);
  const [catalogIds, setCatalogIds] = useState([]);

  const handleParentCatalogsChange = (newCatalogs, options) => {
    const newParentCatalogs = options.map(option => option.props.catalog);

    if (newCatalogs.length === 0) {
      clearSelectedCatalogs();
    } else if (newCatalogs.length > parentCatalogs.length) {
      setParentCatalogs(newParentCatalogs);
      setCatalogIds([
        ...newParentCatalogs.map(parentCatalog => parentCatalog.id),
        ...childCatalogs.map(childCatalog => childCatalog.id),
      ]);
    } else {
      const newChildCatalogs = childCatalogs.filter(childCatalog =>
        newParentCatalogs.includes(childCatalog.parentId)
      );

      setParentCatalogs(newParentCatalogs);
      setChildCatalogs(newChildCatalogs);
      setCatalogIds([
        ...newParentCatalogs.map(parentCatalog => parentCatalog.id),
        ...newChildCatalogs.map(childCatalog => childCatalog.id),
      ]);
    }
  };

  const handleChildCatalogsChange = (newCatalogs, options) => {
    const newChildCatalogs = options.map(option => option.props.catalog);
    setChildCatalogs(newChildCatalogs);
    setCatalogIds([
      ...parentCatalogs.map(parentCatalog => parentCatalog.id),
      ...newChildCatalogs.map(childCatalog => childCatalog.id),
    ]);
  };

  const clearSelectedCatalogs = () => {
    setParentCatalogs([]);
    setChildCatalogs([]);
    setCatalogIds([]);
  };

  return {
    parentCatalogs,
    childCatalogs,
    catalogIds,
    handleParentCatalogsChange,
    handleChildCatalogsChange,
    clearSelectedCatalogs,
  };
};
