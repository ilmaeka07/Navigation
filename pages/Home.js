import { StyleSheet, Text, View, Pressable, TextInput, Modal, FlatList, Alert, TouchableOpacity, Image, Button } from 'react-native';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Images from '../components/imageIndex';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const Home = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showMoney, setShowMoney] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [inputAmount, setInputAmount] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [money, setMoney] = useState(0);
    const [editIndex, setEditIndex] = useState(-1);
    const [editAmount, setEditAmount] = useState('');
    const [category, setCategory] = useState('');
    const [inputCategory, setInputCategory] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const presetAmounts = [10000, 50000, 100000, 500000, 1000000, 2000000];
    const presetCategories = ['Pemasukan', 'Makanan', 'Transportasi', 'Hiburan', 'Kebutuhan', 'Lainnya'];

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        console.warn("A date has been picked: ", date);
        setSelectedDate(date);
        hideDatePicker();
    };

    const handleButtonPress = (type) => {
        setModalType(type);
        setModalVisible(true);
        setInputAmount('');
        setInputDescription('');
        setInputCategory('');
    };

    const handleSubmit = () => {
        if (inputAmount && inputCategory) {
            const amount = parseInt(inputAmount);
            const newMoney = modalType === 'masuk' ? money + amount : money - amount
            setMoney(newMoney);
            
            setTransactions([
                ...transactions,
                {
                    type: modalType,
                    amount: amount,
                    date: new Date(),
                    description: inputDescription || "",
                    category: inputCategory,
                    date: selectedDate,
                }
            ]);
            setModalVisible(false);
        }
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditAmount(transactions[index].amount.toString());
        setModalVisible(true);
        setModalType(transactions[index].type);
        setInputAmount(transactions[index].amount.toString())
        setInputDescription(transactions[index].description);
        setInputCategory(transactions[index].category);
    }

    const handleSubmitEdit = () => {
        if (!inputAmount || !inputCategory) return;
    
        const newAmount = parseInt(inputAmount, 10);
    
      
        setTransactions(prevTransactions => {
            const updatedTransactions = [...prevTransactions];
    
            const oldItem = updatedTransactions[editIndex];
    
            let updatedMoney = money;
            if (oldItem.type === 'masuk') {
                updatedMoney -= oldItem.amount;
            } else {
                updatedMoney += oldItem.amount;
            }
            if (modalType === 'masuk') {
                updatedMoney += newAmount;
            } else {
                updatedMoney -= newAmount;
            }
            setMoney(updatedMoney);
    
    
            updatedTransactions[editIndex] = { ...oldItem, amount: newAmount, description: inputDescription, category: inputCategory };
            return updatedTransactions;
    
        });
    
    
        setEditIndex(-1);
        setModalVisible(false);
        setInputAmount('');
    };

    const handleDelete = (index) => {
        Alert.alert(
            'Confirm Delete',
            'Apakah anda yakin untuk menghapus transaksi ini?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setTransactions(prevTransactions => {  // Functional form of setState!
                            const updatedTransactions = [...prevTransactions];
                            const deletedItem = updatedTransactions.splice(index, 1)[0];

                            // Recalculate money
                            const updatedMoney = deletedItem.type === 'masuk' ? money - deletedItem.amount : money + deletedItem.amount;

                            setMoney(updatedMoney);
                            return updatedTransactions; // Return updated array
                        });
                    }
                }
            ]
        )
    }

    const renderTransaction = ({ item, index }) => (
        <>
        <View style={styles.transactionItem}>
            <View style={styles.transactionIconContainer}>
                <Text>{item.type === 'masuk' ? <Image source={Images.arrowout} style={styles.transactionIcon} /> : <Image source={Images.arrowin} style={styles.transactionIcon} />}</Text>
            </View>
            <View style={styles.transactionDetails}>
                <Text style={[
                    styles.transactionType,
                    item.type === 'masuk' ? styles.transactionTypeMasuk : styles.transactionTypeKeluar
                ]}>{item.type === 'masuk' ? 'Uang Masuk' : 'Uang Keluar'}</Text>
                <Text style={styles.transactionAmount}>Rp. {item.amount.toLocaleString() + ',-'}</Text>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <Text style={styles.transactionDate}>{format(item.date, 'dd MMMM yyyy', { locale: id })}</Text>
                <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
            <View style={styles.transactionButtonContainer}> 
                <Pressable onPress={() => handleEdit(index)}>
                    <Image source={Images.pen} style={styles.transactionIcon} />
                </Pressable>
                <Pressable onPress={() => handleDelete(index)}>
                    <Image source={Images.delete} style={styles.transactionIcon} />
                </Pressable>
            </View>
        </View>
        </>
    );

    const filteredTransactions = transactions.filter(transaction => {
        if (filterType === 'all') {
            return transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
            return transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) && transaction.type === filterType;
        }
    });



    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>
                <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="white"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    /> 
                    {/* <Icon name="search" size={20} color="gray" style={styles.searchIcon} /> */}
                    </View>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => {
                            switch (filterType) {
                                case 'all':
                                    setFilterType('masuk');
                                    break;
                                case 'masuk':
                                    setFilterType('keluar');
                                    break;
                                case 'keluar':
                                    setFilterType('all');
                                    break
                            }
                        }}
                    >
                        <Text style={styles.filterButtonText}>
                            {filterType === 'all' ? 'All' : filterType === 'masuk' ? 'Masuk' : 'Keluar'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.moneyContainer}>
                    <Text style={styles.moneyText}>Rp. {showMoney ? money.toLocaleString() + ',-' : '********'}</Text>
                    <Pressable onPress={ () => setShowMoney(!showMoney)} style={styles.toggleButton}>
                        <Text>{showMoney ? <Image source={Images.hide} style={styles.toggleButton} /> : <Image source={Images.view} style={styles.toggleButton} />}</Text>
                       
                    </Pressable>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable style={styles.button} onPress={() => handleButtonPress('masuk')}>
                        <Image source={Images.arrowoutwhite} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Uang Masuk</Text>
                    </Pressable>
                    <Pressable style={styles.button} onPress={() => handleButtonPress('keluar')}>
                        <Text style={styles.buttonText}>Uang Keluar</Text>
                        <Image source={Images.arrowinwhite} style={styles.buttonIcon} />
                    </Pressable>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.centeredModal}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalType === 'masuk' ? 'Uang Masuk' : 'Uang Keluar'}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={modalType === 'masuk' ? 'Jumlah Uang Masuk' : 'Jumlah Uang Keluar'}
                            keyboardType="numeric"
                            value={inputAmount}
                            onChangeText={setInputAmount}
                        />
                        <View style={styles.presetButtonContainer}>
                            {presetAmounts.map( amount => (
                                <TouchableOpacity
                                    key={amount}
                                    style={styles.presetButton}
                                    onPress={() => {
                                        const currentAmount = parseInt(inputAmount || "0", 10);
                                        const newAmount = currentAmount + amount;
                                        setInputAmount(newAmount.toString());
                                    }}
                                >
                                    <Text style={styles.presetButtonText}>{amount.toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Deskripsi"
                            value={inputDescription}
                            onChangeText={setInputDescription}
                            maxLength={30}
                        />
                        <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={inputCategory}
                            style={styles.picker}
                            onValueChange={(itemValue) =>
                                setInputCategory(itemValue)
                            }>
                                {presetCategories.map((cat) => (
                                    <Picker.Item key={cat} label={cat} value={cat} />
                                ))}
                        </Picker>
                        </View>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date" // You can change to "time" or "datetime" if needed
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                            date={selectedDate} // Set the current selected date
                        />
                        <TouchableOpacity 
                            style={styles.dateButton}
                            onPress={showDatePicker}>
                            <Text style={styles.dateButtonText}>Pilih Tanggal</Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtonContainer}>
                            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Batal</Text>
                            </Pressable>
                            <Pressable style={styles.modalButton} onPress={editIndex === -1 ? handleSubmit : handleSubmitEdit}>
                                <Text style={styles.modalButtonText}>{editIndex === -1 ? 'Submit' : 'Simpan'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item, index) => index.toString()}
                style={styles.transactionList}
            />

            <TouchableOpacity 
                onPress={() => navigation.navigate('Report', { transactions })}
                style={styles.reportButton}
            >
                <Text style={styles.reportButtonText}>Lihat Laporan</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    upperContainer: {
        backgroundColor: '#164863',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        width: '100%',
        marginTop: 32,
    },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbbdbf',
        borderRadius: 8,
        paddingHorizontal: 6,
        marginVertical: 10,
        width: '100%',
    },
    searchInput: {
        flex: 1,
        padding: 8,
        color: 'white',
    },
    searchIcon: {
        marginLeft: 8,
    },
    filterButton: {
        backgroundColor: '#427d9d',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 4,
        marginBottom: 12,
        alignItems: 'center',
    },
    filterButtonText: {
        color: 'white',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        marginBottom: 6,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 12,
        backgroundColor: '#427D9D',
        borderRadius: 8,
        marginHorizontal: 9,
    },
    buttonText: {
        color: 'white',
        marginHorizontal: 8,
    },
    buttonIcon: {
        height: 16,
        width: 16,
    },

    moneyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    moneyText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    toggleButton: {
        height: 20,
        width: 20,
        marginLeft: 12
    },

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset:{
            width: 0,
            height: 2,  
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    
    centeredModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        marginBotton: 15,
        textAlign: 'left',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalInput: {
        height: 40,
        marginVertical: 12,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        width: 280,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    modalButton: {
        paddingVertical: 8,
        backgroundColor: '#263d5c',
        marginHorizontal: 9,
        borderRadius: 8,
        width: 120,
    },
    modalButtonText: {
        color: 'white',
        textAlign: 'center',
    },

    presetButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginTop: 6,
        marginBottom: 6,
        maxWidth: '90%',
    },
    presetButton: {
        backgroundColor: '#427D9D',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        marginVertical: 5,
        width: 100,
    },
    presetButtonText: {
        color: 'white',
        textAlign: 'center',
    },

    transactionList: {
        backgroundColor: 'white',
        marginTop: 20,
        padding: 10,
        width: '100%',
    },
    transactionItem: {
        flexDirection: 'row',
        justifiyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        flexWrap: 'wrap',

        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, 
        shadowRadius: 2,  

        elevation: 3,     
        backgroundColor: 'white',

        borderRadius: 8,
        marginHorizontal: 8,
        marginVertical: 4, 
    },
    
    transactionIconContainer: {
        marginTop: 1,
        marginRight: 10,
    },

    transactionButtonContainer: {
        marginTop: 12,
    },

    transactionIcon: {
        height: 20,
        width: 20,
        borderRadius: 6,
        marginVertical: 10,
        marginHorizontal: 12,
    },

    transactionDetails: {
        flex: 1,
        marginRight: 10,
    },

    transactionType: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: 'black',
    },
    transactionTypeMasuk: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: 'green',
    },
    transactionTypeKeluar: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: 'red',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    transactionDescription: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 3,
    },
    transactionDate: {
        fontWeight: 'bold',
    },
    transactionCategory: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        width: 280,
        height: 40,
        overflow: 'hidden',
        marginVertical: 12,
    },
    picker: {
        height: 40,
        width: '100%',
    },

    reportButton: {
        backgroundColor: '#164863',
        padding: 10,
        marginTop: 12,
        width: '100%',
    },
    reportButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    dateButton: {
        backgroundColor: '#427D9D',
        padding: 10,
        borderRadius: 8,
        marginVertical: 12,
        width: 280,
        textAlign: 'center',
        color: 'white',
    },
    dateButtonText: {
        textAlign: 'center',
        color: 'white',
    },
});

export default Home