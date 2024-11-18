import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';

const Report = ({ route }) => {
    const { transactions } = route.params;
    const [reportData, setReportData] = useState([]);
  
    useEffect(() => {
      const groupedByDateThenCategory = transactions.reduce((acc, curr) => {
  
          const dateStr = format(curr.date, 'dd MMMM yyyy', { locale: id});
  
          if (!acc[dateStr]) {
              acc[dateStr] = {};
            }
            if (!acc[dateStr][curr.category]) {
              acc[dateStr][curr.category] = [];
            }
            acc[dateStr][curr.category].push(curr);
            return acc;
          }, {});
  
          const transformedData = Object.keys(groupedByDateThenCategory)
              .sort((a, b) => {
                  const dateA = parse(a, 'dd MMMM yyyy', new Date(), {locale: id});
                  const dateB = parse(b, 'dd MMMM yyyy', new Date(), {locale: id});
                  return dateB - dateA;
              })
              .map(date => {
              const categoriesForDate = groupedByDateThenCategory[date];
              return {
                title: date,
                data: Object.keys(categoriesForDate).map(category => ({
                  category: category,
                  transactions: categoriesForDate[category],
                }))
              };
            });
  
      setReportData(transformedData);
    }, [transactions]);
  
    const renderItem = ({ item }) => (
      <View>
          <Text style={styles.categoryTitle}>{item.category}</Text> 
          {item.transactions.map((transaction, index) => (
              <View style={styles.reportItem} key={String(transaction.date) + transaction.description + index}>
                  <Text>{transaction.description}</Text>
                  <Text style={transaction.type === 'masuk' ? styles.masuk : styles.keluar}>
                      Rp. {transaction.amount.toLocaleString() + ',-'}
                  </Text>
              </View>
          ))}
      </View>
    );
    
    const renderSectionHeader = ({section: {title}}) => (
      <Text style={styles.sectionHeader}>{title}</Text>
    );
  
    return (
      <View style={styles.container}>
        <SectionList
          sections={reportData}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
  
      </View>
    )
    
  }
  
  const styles = StyleSheet.create({
      container: {
          flex: 1,
          paddingTop: 20,
          backgroundColor: '#fff'
      },
      reportItem: {
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          flexDirection: 'row',
          justifyContent: 'space-between',
  
      },
      sectionHeader: {
          fontSize: 18,
          fontWeight: 'bold',
          backgroundColor: '#f0f0f0',
          padding: 10,
      },
      masuk: {
          color: 'green',
      },
      keluar: {
          color: 'red'
      },
      categoryTitle: {
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 5,
          marginLeft: 10,
      }
  
  });
  
  
  export default Report;