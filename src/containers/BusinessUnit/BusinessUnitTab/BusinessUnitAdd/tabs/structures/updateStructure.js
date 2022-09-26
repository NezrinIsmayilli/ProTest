import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProSelect, ProButton } from 'components/Lib';
import { setSelectedUnitStructure } from 'store/actions/businessUnit';
import styles from '../../styles.module.scss';

const UpdateStructureModal = props => {
  const {
    isLoading,
    toggleRoleModal,
    structures,
    selectedStructures,
    setSelectedStructures,
    setSelectedUnitStructure,
    selectedUnitStructure,
  } = props;

  const dispatch = useDispatch();
  const handleSelectStructure = structuresIds => {
    const [structuresId] = structuresIds;
    const newStructures = structures.find(user => user.id === structuresId);
    setSelectedStructures(prevSelectedStructures => [
      ...prevSelectedStructures,
      newStructures,
    ]);
  };
  const handleSelectedStructureChange = selectedStructureIds => {
    const newStructures = selectedStructures.filter(structure =>
      selectedStructureIds.includes(structure.id)
    );
    setSelectedStructures(newStructures);
  };
  const handleCreateUnitStructure = () => {
    const data = selectedStructures.map(selectedStructure => ({
      id: selectedStructure.id,
      name: selectedStructure.name,
    }));
    dispatch(
      setSelectedUnitStructure({
        newSelectedUnitStructure: [...data, ...selectedUnitStructure],
      })
    );
    toggleRoleModal();
    setSelectedStructures([]);
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>Bölmələr</span>
        <ProSelect
          loading={isLoading}
          mode="multiple"
          value={[]}
          className={styles.selectBox}
          onChange={handleSelectStructure}
          data={structures.filter(
            structure =>
              ![
                ...selectedStructures.map(
                  selectedStructure => selectedStructure.id
                ),
                ...selectedUnitStructure.map(unitStructure => unitStructure.id),
              ].includes(structure.id)
          )}
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş bölmələr</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          onChange={handleSelectedStructureChange}
          value={selectedStructures.map(selected => selected.id)}
          data={selectedStructures}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedStructures.length === 0}
          onClick={handleCreateUnitStructure}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitStructure: state.businessUnitReducer.selectedUnitStructure,
});

export const UpdateStructure = connect(
  mapStateToProps,
  { setSelectedUnitStructure }
)(UpdateStructureModal);
