############################################
### MAP YOUR OCCAM MODEL AS A HYPERGRAPH ###
####### Teresa Schmidt, March 5, 2016 ######
############### tds@pdx.edu ################
############################################

### FIRST TIME INSTALL THESE PACKAGES, SUBSEQUENT TIMES IGNORE by placing '#' in front:
#install.packages("stringr")
install.packages("igraph")

### WHAT IS YOUR RA MODEL? (IN QUOTES): 
Model = "IV:HZh"

### WHAT WILL YOU NAME THE NETWORK? (IN QUOTES):
NetworkName = "LPmod10 to Pmod10"

### WHERE WOULD YOU LIKE YOUR NETWORK (PDF) TO BE SAVED? (FILE PATH IN QUOTES):
setwd("~/Projects/dmit-primes/report")

### DO YOU WANT TO NETWORK LABELS TO BE THE FULL VARIABLE NAMES FROM YOUR OCCAM INPUT FILE? ("Yes" or "No")
Labels = "Yes"
InputPath = "~/Projects/dmit-primes/prime_occam_data/primes_1x1M-160.occam"
#Do you want to remove (ignore) any variables that are not in your model? ("Yes" or "No")
#This ignores variables in the IV or IVI component
Remove = "No"

### WOULD YOU LIKE TO VIEW YOUR NETWORK IN R, IN GEPHI, OR IN BOTH? ("R", "Gephi", or "Both")
Output="R"

### OPTIONAL NETWORK SETTINGS
#Variable color: (see http://www.stat.columbia.edu/~tzheng/files/Rcolor.pdf)
Vcolor = "mediumaquamarine"
#Variable node size:
Vsize = 10
#Variable label size:
Vlabel = .8
#Hyperedge color:
Acolor = "red4"
#Hyperedge node size:
Asize = 2
#Hyperedge label size:
Alabel = .01

################################
library(stringr)
library(igraph)

# Clean up model into a list of associations
Model <- gsub("IVI:|IV:", "", Model)
Associations <- as.data.frame(stringsAsFactors=FALSE, strsplit(Model, ":"))
Associations <- as.data.frame(stringsAsFactors=FALSE, gsub("(?!^)(?=[[:upper:]])", "-", Associations[,], perl=TRUE))

# Calculate the order of each association (2-way, 3-way, etc.)
Frq = as.matrix(sapply(gregexpr("-",Associations[,]),function(Associations)if(Associations[[1]]!=-1) length(Associations) else NA))
Frq <- as.data.frame(Frq+1)
EdgeOrder = cbind(Freq=Frq, Associations=Associations)
colnames(EdgeOrder) <- c("Order", "Association")

# Determine edges for all 2-way associations
Edges = subset(EdgeOrder, EdgeOrder[,1]==2, stringsAsFactors=FALSE)
Edges <- as.data.frame(str_split_fixed(Edges[,2], "-", 2))
colnames(Edges) <- c("Source", "Target")

# Determine edges for all 3-way and higher-way associations
Hyper = subset(EdgeOrder, EdgeOrder[,1]>2, stringsAsFactors=FALSE)
colnames(Hyper) <- c("Association", "Members")

# Number the higher-way associations
Hyper[,1] <- 1:nrow(Hyper)

# Link each variable from a higher-way association to the association number as a two-way association
Hyper[,2] <- as.character(Hyper[,2])
s <- strsplit(Hyper$Members, split = "-")
HyperEdges = data.frame(Source = as.factor(rep(Hyper$Association, sapply(s, length))), Target = unlist(s))

# Combine two-way and higher-way edges into one list of edges
Edgefile = rbind.data.frame(as.matrix(Edges), as.matrix(HyperEdges))
if(Output=="Gephi" | Output=="Both") {write.csv(Edgefile, paste0(NetworkName, " EdgeList.csv"), row.names=FALSE, quote=FALSE)}

# Create nodelist from OCCAM file (if "Yes") or from model associations
if(Labels=="Yes") {Nodes = read.table(stringsAsFactors=FALSE, textConnection(readLines(InputPath)[grep(",1,|,2,", readLines(InputPath))]), sep=",")} 
if(Labels=="Yes") {Nodes[,] <- gsub("\t", "", as.matrix(Nodes[,]))}
if(Labels=="Yes") {Nodes <- cbind.data.frame(ID=Nodes$V4, Label=Nodes$V1, Type="Variable")}
if(Labels=="Yes") {Nodes[,1] <-tolower(as.character(Nodes[,1]))}
if(Labels=="Yes") {simpleCap <- function(x) {paste(toupper(substring(x, 1,1)), substring(x, 2), sep="")}}
if(Labels=="Yes") {Nodes <- sapply(Nodes[,], simpleCap)}
if(Labels=="Yes") {Nodes <- cbind.data.frame(Nodes, "10")
} else {Nodes <- cbind(unlist(unique(unlist(strsplit(as.character(Associations[,1]), "-")))),
                   unlist(unique(unlist(strsplit(as.character(Associations[,1]), "-")))), 
                   "variable", "10")}
colnames(Nodes) <- c("ID", "label", "Type", "Size")

# Identify HyperNodes
HyperNodes = as.data.frame(0:nrow(Hyper))
HyperNodes <- cbind.data.frame(HyperNodes, HyperNodes, "HyperEdge", "4")
colnames(HyperNodes) <- c("ID", "label", "Type", "Size")

# Create final nodelist with hypernodes
HyperNodes[,1] <-as.character(HyperNodes[,1])
HyperNodes[,2] <-as.character(HyperNodes[,2])
Nodefile = rbind(as.matrix(Nodes), as.matrix(HyperNodes))
Nodefile <- Nodefile[!grepl("^0$", Nodefile[,1]),]

# Remove any isolate nodes (from OCCAM input file)
if(Remove=="Yes") Nodefile <- Nodefile[grepl(paste(unique(unlist(Edgefile[,])), collapse="|"), Nodefile[,1]),]
if(Output=="Gephi" | Output=="Both") {write.csv(Nodefile, paste0(NetworkName, " NodeList.csv"), row.names=FALSE, quote=FALSE)}

# Create hypergraph
if(Output=="R" | Output=="Both") {Hypergraph = graph.data.frame(Edgefile, directed=FALSE, vertices=Nodefile[,1])}
if(Output=="R" | Output=="Both") {V(Hypergraph)$color <- ifelse(V(Hypergraph)$name %in% Nodes[,1], Vcolor, Acolor)}
if(Output=="R" | Output=="Both") {V(Hypergraph)$size <- ifelse(V(Hypergraph)$name %in% Nodes[,1], Vsize, Asize)}
if(Output=="R" | Output=="Both") {plot(Hypergraph, vertex.label.color="black", vertex.label.cex=ifelse(V(Hypergraph)$name %in% Nodes[,1], Vlabel, Alabel), vertex.label=Nodefile[,2])}
if(Output=="R" | Output=="Both") {name=paste0(NetworkName, ".pdf")}
if(Output=="R" | Output=="Both") {pdf(name)}
if(Output=="R" | Output=="Both") {plot(Hypergraph, vertex.label.color="black", vertex.label.cex=ifelse(V(Hypergraph)$name %in% Nodes[,1], Vlabel, Alabel), vertex.label=Nodefile[,2])}
if(Output=="R" | Output=="Both") {dev.off()}

if(Output=="R") {noquote(c("YOUR PDF OF THE GRAPH CAN BE RETRIEVED AT:", getwd()))
} else {noquote(c("YOUR NEW FILES CAN BE RETRIEVED AT:", getwd(), 
                  "NOTE: When Importing the Nodefile into Gephi,", 
                  "the 'Type' variable should be classified as a String variable,", 
                  "and the 'Size' variable should be classified as a Float variable"))}
