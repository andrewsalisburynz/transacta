# Requirements Clarification Questions

I detected one potential contradiction in your responses that needs clarification:

## Contradiction 1: CSV Format vs Implementation Complexity

You indicated "Custom format (I can provide a sample)" (Q3:B) and also "Critical - I want sophisticated ML from the start" (Q10:A), but chose "Simple file-based storage (JSON/CSV files)" (Q7:C).

This creates a potential issue: sophisticated ML typically requires structured data storage (database) for efficient training, feature extraction, and model persistence. File-based storage may limit ML capabilities and performance.

### Clarification Question 1
Given your need for sophisticated ML, would you reconsider the data storage approach?

A) Yes, use SQLite (local database) - better for ML while keeping data local
B) Yes, use a proper database but I'm open to recommendations
C) No, I want to stick with file-based storage and accept ML limitations
D) Let's start with file-based and migrate to database later if needed
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Clarification 2: CSV Format Sample

You mentioned you have a custom CSV format (Q3:B). To properly design the CSV parser, could you provide details about your bank's CSV format?

### Clarification Question 2
Can you describe or provide a sample of your CSV format? (You can paste a few anonymized rows here)

A) I'll provide a sample below in the answer section
B) Standard format but with extra columns (I'll describe below)
C) I have multiple formats from different banks (I'll describe below)
D) I'm not sure yet - let's design for flexibility
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**If you selected A, B, or C above, please provide the CSV format details here:**
```
Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
06/01/26,-14.00,STITCHBIRD FABRICS,169829273141,WELLINGTON,0499061501,POS,02-1269-0029601-66,---,,"00",4303,"02-0499",06/01/26
06/01/26,-34.00,Busy Bee Quilt Shop,169829273141,Wellington,0499061513,POS,02-1269-0029601-66,---,,"00",4304,"02-0499",06/01/26
07/01/26,49.00,Savings,,,INTERNET XFR,FT,02-1269-0029601-66,02-1269-0029601-10,,"50",0000,"02-1255",07/01/26
08/01/26,-14.00,WING ON CHANG FOOD,554304771434,BROOKLYN WEL,0499081834,POS,02-1269-0029601-66,---,,"00",8138,"02-0499",08/01/26
10/01/26,-24.00,GB GARDENS,169829273141,LEVIN,0499101003,POS,02-1269-0029601-66,---,,"00",0360,"02-0499",10/01/26
10/01/26,-9.00,Moshims,169829273141,Wellington,0499101010,POS,02-1269-0029601-66,---,,"00",0359,"02-0499",10/01/26
10/01/26,-8.60,VEGETABLE GARDEN,169829273141,LEVIN,0499101016,POS,02-1269-0029601-66,---,,"00",0361,"02-0499",10/01/26
11/01/26,-36.85,MOORE WILSONS Cnr To,169829273141,WELLINGTON,0499111501,POS,02-1269-0029601-66,---,,"00",9559,"02-0499",11/01/26
11/01/26,-20.40,MOORE WILSONS Cnr To,169829273141,WELLINGTON,0499111509,POS,02-1269-0029601-66,---,,"00",9560,"02-0499",11/01/26
```

---

**Instructions**: Please answer these 2 clarification questions before we proceed with the requirements document.
