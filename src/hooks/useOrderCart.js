import { useState, useEffect } from 'react';
import { re_amount } from 'utils';
import { toast } from 'react-toastify';

export const useOrderCart = () => {
  const [selectedCounterparty, setSelectedCounterparty] = useState(undefined);
  const [cartIsVisible, setCartIsVisible] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredOrderCart, setFilteredOrderCart] = useState([]);
  const [seller, setSeller] = useState(undefined);
  const [expeditor, setExpeditor] = useState(undefined);
  const [buyer, setBuyer] = useState(undefined);
  const [orderDate, setOrderDate] = useState();
  const [initialStatus, setInitialStatus] = useState(2);
  const [deliveredBy, setDeliveredBy] = useState(undefined);
  const [direction, setDirection] = useState(undefined);
  const [description, setDescription] = useState(undefined);
  const [dateIsFree, setDateIsFree] = useState(false);
  const [query, setQuery] = useState(undefined);

  useEffect(() => {
    if (!query) {
      setFilteredOrderCart(selectedProducts);
    } else {
      setFilteredOrderCart(
        selectedProducts.filter(product => product.name.includes(query))
      );
    }
  }, [selectedProducts, query]);

  const handleQueryChange = query => setQuery(query);

  const changeCounterparty = (counterparty, tenant,customer) => {

    setSelectedCounterparty(counterparty);
    setSeller(counterparty);
    if (counterparty.isTenant) {
      if(customer.length===1){
        setBuyer(counterparty.id!==customer[0].id? customer[0]:undefined)
      }
      else{
        setBuyer(undefined)
      }
      setDeliveredBy(counterparty.id);
    } else {
      setBuyer(tenant);
      setDeliveredBy(undefined);
      setExpeditor(undefined);
    }
    resetOrderCart();
  };

  const handleFreeDate = checked => {
    setOrderDate(undefined);
    setDateIsFree(checked);
  };

  const handleExpeditorChange = expeditorId => {
    setExpeditor(expeditorId);
  };
  const handleBuyerChange = buyer => {
    setExpeditor(undefined);
    setBuyer(buyer);
  };
  const handleOrderDateChange = date => {
    setOrderDate(date);
  };
  const handleOrderStageChange = stage => {
    setInitialStatus(stage);
  };
  const handleProductCountChange = (productCount, product, type, mode) => {
    let newProducts = [];
    if (
      (re_amount.test(Number(productCount)) && productCount <= 10000000) ||
      productCount === ''
    ) {
      if (!productCount && mode === 'delete') {
        newProducts = selectedProducts.filter(
          selectedProduct => selectedProduct.id !== product.id
        );
      } else if (
        selectedProducts.some(
          selectedProduct => selectedProduct.id === product.id
        )
      ) {
        newProducts = selectedProducts.map(selectedProduct =>
          selectedProduct.id === product.id
            ? type === 'quantity'
              ? { ...product, quantity: productCount }
              : { ...product, pricePerUnit: productCount }
            : selectedProduct
        );
      } else {
        newProducts = [
          ...selectedProducts,
          type === 'quantity'
            ? { ...product, quantity: productCount }
            : { ...product, pricePerUnit: productCount },
        ];
      }

      setSelectedProducts(newProducts);
    }
  };

  const handleProductAdd = products => {
    setSelectedProducts([...products, ...selectedProducts]);
  };

  const handleDelivery = value => {
    setExpeditor(undefined);
    setDeliveredBy(value);
  };
  const updateDescription = newDescription => {
    setDescription(newDescription);
  };
  const toggleCart = () => {
    setCartIsVisible(oldState => !oldState);
  };
  const resetOrderCart = () => {
    setSelectedProducts([]);
    setDescription(undefined);
  };

  const completeOrder = (isDraft, createOrder, tenant) => {
    const items_ul = {
      ...selectedProducts.map(product => ({
        product: product.id,
        quantity: product.quantity,
        price: product.pricePerUnit,
      })),
    };

    let partner = null;
    let direction = null;
    if (selectedCounterparty.isTenant) {
      direction = 1;
      partner = buyer.id;
    } else {
      direction = 2;
      partner = seller.id;
    }
    if (selectedProducts.some(({ quantity }) => Number(quantity || 0) === 0)) {
      toast.error('Say sıfır və ya boş ola bilməz!');
    } else {
      createOrder(
        {
          partner,
          direction,
          deliveredByParty: deliveredBy === seller.id ? 1 : 2,
          deliveredByTenantPerson:
            buyer.id === tenant.id && deliveredBy === seller.id
              ? null
              : expeditor || null,
          deliveryDate: orderDate || null,
          initialStage: initialStatus,
          description,
          isDraft,
          items_ul,
        },
        () => {
          toast.success('Sifariş uğurla yaradıldı.');
          toggleCart();
          resetOrderCart();
          setOrderDate(undefined);
          setDirection(undefined);
          setDeliveredBy(undefined);
          setExpeditor(undefined);
          setInitialStatus(2);
        }
      );
    }
  };

  return [
    {
      changeCounterparty,
      handleProductCountChange,
      handleProductAdd,
      handleOrderStageChange,
      updateDescription,
      handleFreeDate,
      toggleCart,
      resetOrderCart,
      completeOrder,
      handleOrderDateChange,
      handleExpeditorChange,
      handleBuyerChange,
      handleDelivery,
      handleQueryChange,
    },
    {
      seller,
      buyer,
      orderDate,
      initialStatus,
      deliveredBy,
      dateIsFree,
      direction,
      selectedCounterparty,
      expeditor,
      filteredOrderCart,
      selectedProducts,
      description,
      cartIsVisible,
    },
  ];
};
